"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// PLANTILLA GENERICA DE SERVER ACTIONS
// Copiar y adaptar para cada caso de estudio.
// Reemplazar "Entidad" con el nombre del modelo Prisma (ej: Venta, Cliente, Producto)
// ─────────────────────────────────────────────────────────────────────────────

// ── LECTURA ──────────────────────────────────────────────────────────────────

/** Obtener todos los registros. Se puede llamar directamente desde un Server Component. */
export async function getAll() {
	// return await prisma.entidad.findMany({
	//   include: { relacion: true },       // incluir relaciones 1-N o N-1
	//   orderBy: { id: "desc" },           // ordenar por campo
	// });
}

/** Obtener un registro por ID */
export async function getById(id: number) {
	// return await prisma.entidad.findUnique({
	//   where: { id },
	//   include: { relacion: true },
	// });
}

/** Buscar registros por un campo de texto */
export async function search(termino: string) {
	// return await prisma.entidad.findMany({
	//   where: {
	//     nombre: { contains: termino },   // SQLite: contiene el texto
	//   },
	// });
}

// ── MUTACIONES ───────────────────────────────────────────────────────────────

/** Crear un nuevo registro */
export async function create(data: {
	// nombre: string;
	// valor: number;
	// relacion?: { connect: { id: number } }; // conectar con relacion existente
}) {
	// await prisma.entidad.create({ data });
	revalidatePath("/"); // refrescar datos en la pagina
}

/** Actualizar un registro existente */
export async function update(id: number, data: {
	// nombre?: string;
	// valor?: number;
}) {
	// await prisma.entidad.update({
	//   where: { id },
	//   data,
	// });
	revalidatePath("/");
}

/** Eliminar un registro */
export async function remove(id: number) {
	// await prisma.entidad.delete({
	//   where: { id },
	// });
	revalidatePath("/");
}

// ─────────────────────────────────────────────────────────────────────────────
// EJEMPLO REAL: Sistema de Ventas (descomentar y adaptar)
// ─────────────────────────────────────────────────────────────────────────────

// export async function getVentas() {
//   return await prisma.venta.findMany({
//     include: {
//       cliente: true,   // trae los datos del cliente relacionado
//       detalles: {
//         include: { producto: true }  // detalles con su producto
//       },
//     },
//     orderBy: { fecha: "desc" },
//   });
// }

// export async function registrarVenta(data: {
//   clienteId: number;
//   fecha: string;
//   detalles: { productoId: number; cantidad: number; precio: number }[];
// }) {
//   await prisma.venta.create({
//     data: {
//       clienteId: data.clienteId,
//       fecha: new Date(data.fecha),
//       detalles: {
//         create: data.detalles,  // crea los registros hijos al mismo tiempo
//       },
//     },
//   });
//   revalidatePath("/");
// }

// export async function buscarClientePorNombre(nombre: string) {
//   return await prisma.cliente.findFirst({
//     where: { nombre: { contains: nombre } },
//   });
// }
