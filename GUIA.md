# Guia de Defensa - Proyecto Base

> ORM instalado: **Prisma 6.10.1** (no TypeORM)  
> Framework: **Next.js 15.3.1** con App Router  
> UI: **HeroUI v2** + **Tailwind CSS**

---

## 1. Comandos para iniciar el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Generar el cliente de Prisma (siempre despues de cambiar el schema)
npx prisma generate

# 3. Crear/aplicar migraciones (crea la base de datos SQLite)
npx prisma migrate dev --name init

# 4. (Opcional) Poblar la base de datos con datos de prueba
npx prisma db seed

# 5. Correr el servidor de desarrollo
npm run dev
```

**Flujo cuando cambias el schema.prisma:**
```bash
npx prisma migrate dev --name descripcion_del_cambio
# Esto: crea la migración + aplica los cambios + regenera el cliente
```

**Comandos utiles de Prisma:**
```bash
npx prisma studio          # Abrir UI visual de la base de datos (http://localhost:5555)
npx prisma migrate reset   # Borrar toda la DB y re-aplicar migraciones (cuidado, borra datos)
npx prisma migrate status  # Ver estado de las migraciones
npx prisma db push         # Aplicar cambios del schema SIN crear archivo de migración (prototipado rapido)
```

---

## 2. Arquitectura del proyecto

```
base/
├── app/                    # Next.js App Router (rutas)
│   ├── layout.tsx          # Layout raiz: HeroUI Provider + ThemeProvider
│   ├── page.tsx            # Pagina principal (Server Component por defecto)
│   ├── error.tsx           # Manejo de errores globales
│   └── providers.tsx       # Providers del lado del cliente
│
├── components/             # Componentes React
│   ├── ui/
│   │   ├── DynamicFormBuilder.tsx  # Formulario dinamico con react-hook-form
│   │   └── DynamicTable.tsx        # Tabla generica con soporte para campos anidados
│   ├── ExampleForm.tsx     # Ejemplo de uso de DynamicFormBuilder
│   ├── theme-switch.tsx    # Toggle dark/light mode
│   └── icons.tsx           # Iconos SVG
│
├── actions/
│   └── actions.ts          # Server Actions ("use server") - mutaciones de datos
│
├── services/
│   └── service.ts          # Logica de negocio (llama a prisma)
│
├── lib/
│   ├── prisma.ts           # Singleton de PrismaClient
│   └── helpers/
│       └── formatDate.ts   # Formateo de fechas en español
│
├── types/
│   └── index.ts            # Tipos TypeScript compartidos
│
├── config/
│   ├── site.ts             # Metadatos y navegacion del sitio
│   └── fonts.ts            # Configuracion de fuentes
│
├── prisma/
│   ├── schema.prisma       # Esquema de la base de datos
│   └── seed.ts             # Script para poblar datos iniciales
│
└── generated/prisma/       # Cliente Prisma auto-generado (no editar)
```

**Regla importante:** Los componentes son Server Components por defecto. Solo agregar `"use client"` si necesitan estado (`useState`), efectos (`useEffect`) o eventos del navegador.

---

## 3. Prisma - Relaciones en schema.prisma

### Relacion Uno a Muchos (1-N) - la mas comun

Un cliente puede tener muchas ventas:

```prisma
model Cliente {
  id     Int     @id @default(autoincrement())
  nombre String
  ventas Venta[] // Un cliente tiene muchas ventas
}

model Venta {
  id        Int      @id @default(autoincrement())
  monto     Float
  fecha     DateTime @default(now())
  clienteId Int
  cliente   Cliente  @relation(fields: [clienteId], references: [id])
  //                           ^ FK en esta tabla  ^ PK en la otra
}
```

**Como usar en actions.ts:**
```typescript
// Obtener ventas CON datos del cliente incluidos
const ventas = await prisma.venta.findMany({
  include: { cliente: true }
})

// Crear venta ligada a un cliente existente
await prisma.venta.create({
  data: {
    monto: 150.0,
    clienteId: 3  // ID del cliente existente
  }
})
```

---

### Relacion Muchos a Muchos (N-N)

Un estudiante puede inscribirse en muchos cursos, un curso tiene muchos estudiantes:

```prisma
model Estudiante {
  id       Int          @id @default(autoincrement())
  nombre   String
  cursos   Inscripcion[]
}

model Curso {
  id           Int          @id @default(autoincrement())
  nombre       String
  estudiantes  Inscripcion[]
}

// Tabla intermedia con campos propios
model Inscripcion {
  id           Int        @id @default(autoincrement())
  fechaInscrito DateTime  @default(now())
  nota         Float?
  estudianteId Int
  cursoId      Int
  estudiante   Estudiante @relation(fields: [estudianteId], references: [id])
  curso        Curso      @relation(fields: [cursoId], references: [id])
}
```

**Como usar:**
```typescript
// Obtener estudiantes con sus cursos
const estudiantes = await prisma.estudiante.findMany({
  include: {
    cursos: {
      include: { curso: true }  // incluir datos del curso tambien
    }
  }
})
```

---

### Relacion Uno a Uno (1-1)

Un usuario tiene un perfil:

```prisma
model Usuario {
  id     Int     @id @default(autoincrement())
  email  String  @unique
  perfil Perfil?
}

model Perfil {
  id        Int     @id @default(autoincrement())
  bio       String?
  usuarioId Int     @unique  // @unique hace la relacion 1-1
  usuario   Usuario @relation(fields: [usuarioId], references: [id])
}
```

---

### Referencia rapida de atributos Prisma

| Atributo | Significado |
|---|---|
| `@id` | Clave primaria |
| `@default(autoincrement())` | Auto-incremento |
| `@default(now())` | Fecha actual al crear |
| `@unique` | Valor unico en la tabla |
| `@relation(fields: [fk], references: [pk])` | Define la FK |
| `String?` / `Int?` | Campo opcional (puede ser null) |

---

## 4. Componentes reutilizables

### DynamicFormBuilder

Formulario dinamico que se configura con un schema de campos.

**Importar:**
```typescript
import { DynamicFormBuilder, FormSchema } from "@/components/ui/DynamicFormBuilder";
```

**Tipos de campo disponibles:**
- `text` - Texto libre
- `email` - Email con validacion de formato
- `number` - Numero
- `date` - Fecha (YYYY-MM-DD)
- `datetime-local` - Fecha y hora
- `select` - Lista desplegable
- `array` - Lista de sub-formularios (filas dinamicas)

**Ejemplo basico:**
```typescript
"use client";
import { DynamicFormBuilder, FormSchema } from "@/components/ui/DynamicFormBuilder";

const schema: FormSchema = {
  fields: [
    { name: "nombre", label: "Nombre", type: "text", required: true },
    { name: "fecha",  label: "Fecha",  type: "date", required: true },
    {
      name: "estado",
      label: "Estado",
      type: "select",
      options: ["Activo", "Inactivo", "Pendiente"],
    },
  ],
};

export default function MiFormulario() {
  const handleSubmit = async (data: any) => {
    await crearEntidad(data);  // llamar a un server action
  };

  return <DynamicFormBuilder schema={schema} onSubmit={handleSubmit} />;
}
```

**Select con label diferente al value:**
```typescript
{
  name: "productoId",
  label: "Producto",
  type: "select",
  options: [
    { label: "Laptop Dell",    value: "1" },
    { label: "Mouse Logitech", value: "2" },
  ],
}
```

**Campo array (filas dinamicas - para detalles de pedido, etc.):**
```typescript
{
  name: "detalles",
  label: "Productos",
  type: "array",
  fields: [
    { name: "productoId", label: "Producto", type: "select", options: ["Laptop", "Mouse"] },
    { name: "cantidad",   label: "Cantidad", type: "number", required: true },
    { name: "precio",     label: "Precio",   type: "number", required: true },
  ],
}
```

Los datos llegaran al `onSubmit` como:
```json
{
  "detalles": [
    { "productoId": "Laptop", "cantidad": "2", "precio": "1500" },
    { "productoId": "Mouse",  "cantidad": "3", "precio": "25" }
  ]
}
```

---

### DynamicTable

Tabla generica que muestra cualquier arreglo de datos.

**Importar:**
```typescript
import { DynamicTable } from "@/components/ui/DynamicTable";
```

**Uso basico:**
```typescript
// En un Server Component:
const ventas = await prisma.venta.findMany({ include: { cliente: true } });

return (
  <DynamicTable
    data={ventas}
    columns={[
      { key: "id",              label: "ID" },
      { key: "monto",           label: "Monto" },
      { key: "cliente.nombre",  label: "Cliente" },  // campo anidado con punto
      { key: "fecha",           label: "Fecha" },
    ]}
  />
);
```

**Columna con render personalizado:**
```typescript
{
  key: "fecha",
  label: "Fecha",
  render: (row) => formatDate(row.fecha.toString()),  // usar helper de formateo
}
```

**Ocultar una columna:**
```typescript
{ key: "id", label: "ID", visible: false }  // no se muestra pero se puede usar en render
```

**Columna con boton de accion:**
```typescript
{
  key: "acciones",
  label: "Acciones",
  render: (row) => (
    <button onClick={() => handleEliminar(row.id)} className="text-red-500">
      Eliminar
    </button>
  ),
}
```

---

## 5. Server Actions

Las server actions van en `actions/actions.ts` con la directiva `"use server"` al inicio.

**Patron estandar:**
```typescript
"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Lectura (puede ir en el Server Component directamente o aqui)
export async function getEntidades() {
  return await prisma.entidad.findMany({
    include: { relacion: true },
    orderBy: { id: "desc" },
  });
}

// Mutacion
export async function crearEntidad(data: { nombre: string; valor: number }) {
  await prisma.entidad.create({ data });
  revalidatePath("/");  // refrescar la pagina para mostrar los nuevos datos
}
```

**Llamar desde un Client Component:**
```typescript
"use client";
import { crearEntidad } from "@/actions/actions";

// En el handler del formulario:
const handleSubmit = async (data: any) => {
  await crearEntidad({ nombre: data.nombre, valor: Number(data.valor) });
};
```

**Llamar desde un Server Component (page.tsx):**
```typescript
// app/page.tsx - Server Component
import { getEntidades } from "@/actions/actions";

export default async function Home() {
  const entidades = await getEntidades();  // se llama directo, sin fetch
  return <MiTabla data={entidades} />;
}
```

---

## 6. Helpers de formateo de fechas

```typescript
import { formatDate, formatDateTime } from "@/lib/helpers/formatDate";

formatDate("2024-03-15")                      // "15 de marzo de 2024"
formatDateTime("2024-03-15T10:30:00.000Z")    // "15 de marzo de 2024, 6:30:00 a. m."
```

Usar en `DynamicTable` con `render`:
```typescript
{ key: "fecha", label: "Fecha", render: (row) => formatDate(row.fecha.toString()) }
```

---

## 7. Flujo tipico para un caso de estudio

1. **Definir modelos en `prisma/schema.prisma`**
2. **Ejecutar migración:**
   ```bash
   npx prisma migrate dev --name nombre_caso
   ```
3. **Crear las queries en `actions/actions.ts`** (ver `actions.ts` para plantillas)
4. **Crear componente de formulario** (usando `DynamicFormBuilder` o componente custom)
5. **Crear componente de tabla** (usando `DynamicTable` o componente custom)
6. **En `app/page.tsx`:** obtener datos con el action y renderizar componentes

---

## 8. Alias de importacion

El proyecto tiene configurado `@/` como alias de la raiz:

```typescript
import prisma from "@/lib/prisma";              // lib/prisma.ts
import { DynamicTable } from "@/components/ui/DynamicTable";
import { formatDate } from "@/lib/helpers/formatDate";
import { crearVenta } from "@/actions/actions";
```

---

## Notas rapidas

- **`DATABASE_URL`** esta en `.env` → `file:./dev.db` (SQLite local)
- El cliente Prisma se genera en `generated/prisma/` (no editar esa carpeta)
- `npx prisma studio` abre una UI en `http://localhost:5555` para ver/editar datos
- Los **Server Components** no pueden usar `useState`/`useEffect` → agregar `"use client"` si lo necesitan
- `revalidatePath("/")` en un server action fuerza al Server Component a re-fetch los datos
