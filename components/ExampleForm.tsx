"use client";
import React from "react";
import { DynamicFormBuilder } from "./DynamicFormBuilder";
import { FormSchema } from "./DynamicFormBuilder";

const formSchema: FormSchema = {
	fields: [
		{ name: "cliente", label: "Cliente", type: "text", required: true },
		{ name: "fecha", label: "Fecha", type: "date", required: true },
		{
			name: "productos",
			label: "Productos",
			type: "array",
			fields: [
				{
					name: "productId",
					label: "Producto",
					type: "select",
					required: true,
					options: ["Laptop", "Mouse", "Teclado"],
				},
				{
					name: "quantity",
					label: "Cantidad",
					type: "number",
					required: true,
				},
				{
					name: "price",
					label: "Precio",
					type: "number",
					required: true,
				},
			],
		},
	],
};

const ExampleForm = () => {
	const handleSubmit = (data: any) => {
		console.log("Datos del formulario:", data);
	};

	return (
		<div className="w-full">
			<DynamicFormBuilder schema={formSchema} onSubmit={handleSubmit} />
		</div>
	);
};

export default ExampleForm;
