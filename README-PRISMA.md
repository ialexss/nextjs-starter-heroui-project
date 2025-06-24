# Guía de Comandos Iniciales y Prisma

## Instalación Inicial

```bash
npm install
```

## Prisma: Comandos Útiles

### Inicializar Prisma (si es necesario)
```bash
npx prisma init
```

### Generar Cliente Prisma
```bash
npx prisma generate
```

### Crear una Nueva Migración
```bash
npx prisma migrate dev --name nombre_migracion
```

### Aplicar Migraciones en Producción
```bash
npx prisma migrate deploy
```

### Ver el Estado de las Migraciones
```bash
npx prisma migrate status
```

### Resetear la Base de Datos (¡Cuidado! Borra los datos)
```bash
npx prisma migrate reset
```

### Ejecutar el Seed (semilla de datos)
```bash
npx prisma db seed
```

### Abrir Prisma Studio (UI para la base de datos)
```bash
npx prisma studio
```

## Ayuda y Recursos
- [Documentación oficial de Prisma](https://www.prisma.io/docs/)
- [Comandos CLI de Prisma](https://www.prisma.io/docs/reference/api-reference/command-reference)

## Notas
- Asegúrate de tener configurado el archivo `.env` con la variable `DATABASE_URL`.
- El archivo de seed se encuentra en `prisma/seed.ts`.
- Si usas TypeScript, asegúrate de que el seed esté correctamente exportado.

---

## Ejemplo de schema.prisma

```prisma
// Archivo: prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  name  String
  email String  @unique
  posts Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User?    @relation(fields: [authorId], references: [id])
  authorId  Int?
}
```

---

> Cualquier duda, revisa la documentación oficial o consulta con el equipo.
