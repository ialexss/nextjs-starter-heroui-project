"use client";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";

export type BaseField = {
	name: string;
	label: string;
	type: "text" | "email" | "number" | "date" | "datetime-local" | "select";
	required?: boolean;
	// Para select: puede ser un array de strings (valor == label)
	// o un array de objetos { label, value } cuando se requiere un value distinto al label
	options?: Array<string | { label: string; value: string }>;
};

export type ArrayField = {
	name: string;
	label: string;
	type: "array";
	fields: BaseField[];
};

export type Field = BaseField | ArrayField;

export type FormSchema = {
	fields: Field[];
};

export type Props = {
	schema: FormSchema;
	onSubmit: (data: any) => void;
};

export const DynamicFormBuilder = ({ schema, onSubmit }: Props) => {
	const { register, control, handleSubmit, setValue, watch } = useForm<
		Record<string, any>
	>({
		defaultValues: {},
	});

	const renderBaseField = (field: BaseField, parentName = "") => {
		const fieldName = parentName
			? `${parentName}.${field.name}`
			: field.name;

		switch (field.type) {
			case "select":
				return (
					<div className="space-y-1">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
							{field.label}
						</label>
						<select
							className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900/60"
							{...register(fieldName, {
								required: field.required,
							})}
						>
							<option value="">Seleccione una opción</option>
							{field.options?.map((opt, i) => {
								if (typeof opt === "string") {
									return (
										<option
											key={`${fieldName}-${i}-${opt}`}
											value={opt}
										>
											{opt}
										</option>
									);
								}
								return (
									<option
										key={`${fieldName}-${i}-${opt.value}`}
										value={opt.value}
									>
										{opt.label}
									</option>
								);
							})}
						</select>
					</div>
				);
			default:
				return (
					<div className="space-y-1">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
							{field.label}
						</label>
						<input
							type={field.type}
							className="mt-1 block w-full rounded-md border border-gray-300 bg-white/80 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900/60"
							{...register(fieldName, {
								required: field.required,
							})}
						/>
					</div>
				);
		}
	};

	const renderArrayField = (field: ArrayField) => {
		const { fields, append, remove } = useFieldArray({
			control,
			name: field.name,
		});

		return (
			<div className="space-y-3">
				<label className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
					{field.label}
				</label>
				<div className="flex flex-wrap gap-2">
					{fields.map((item, index) => (
						<div
							key={item.id}
							className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 bg-white dark:bg-gray-900 space-y-3 min-w-sm"
						>
							{field.fields.map((subField) => (
								<div key={subField.name}>
									{renderBaseField(
										subField,
										`${field.name}.${index}`
									)}
								</div>
							))}
							<div className="flex justify-end">
								<button
									type="button"
									className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
									onClick={() => remove(index)}
								>
									Eliminar
								</button>
							</div>
						</div>
					))}
				</div>

				<button
					type="button"
					className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
					onClick={() => append({})}
				>
					Agregar {field.label}
				</button>
			</div>
		);
	};

	const renderField = (field: Field) => {
		if (field.type === "array") {
			return renderArrayField(field);
		}
		return renderBaseField(field);
	};

	const handleFormSubmit: SubmitHandler<any> = (data) => {
		onSubmit(data);
	};

	return (
		<form
			onSubmit={handleSubmit(handleFormSubmit)}
			className="w-full  mx-auto space-y-6"
		>
			{schema.fields.map((field) => (
				<div key={field.name} className="mb-4">
					{renderField(field)}
				</div>
			))}
			<div className="pt-2">
				<button
					type="submit"
					className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
				>
					Enviar
				</button>
			</div>
		</form>
	);
};
