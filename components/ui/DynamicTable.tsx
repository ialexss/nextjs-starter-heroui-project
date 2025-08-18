import React from "react";

type ColumnConfig<T> = {
	key: string; // puede ser "key.nombre" o "key"
	label?: string;
	visible?: boolean;
	render?: (row: T) => React.ReactNode; // función custom para renderizar
};

type DynamicTableProps<T> = {
	data: T[];
	columns: ColumnConfig<T>[];
};

// Utilidad para acceder a "key.nombre" desde un objeto
function getNestedValue(obj: any, path: string) {
	return path
		.split(".")
		.reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export function DynamicTable<T extends object>({
	data,
	columns,
}: DynamicTableProps<T>) {
	return (
		<div className="w-full overflow-x-auto rounded-lg shadow-sm">
			<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
				<thead className="bg-gray-50 dark:bg-gray-800">
					<tr>
						{columns
							.filter((col) => col.visible !== false)
							.map((col) => (
								<th
									key={col.key}
									className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									{col.label || col.key}
								</th>
							))}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900">
					{data.map((row, rowIndex) => (
						<tr
							key={rowIndex}
							className={`hover:bg-gray-50 dark:hover:bg-neutral-800 ${
								rowIndex % 2 === 0
									? "bg-white dark:bg-gray-900"
									: "bg-gray-50 dark:bg-neutral-950"
							}`}
						>
							{columns
								.filter((col) => col.visible !== false)
								.map((col) => (
									<td
										key={`${rowIndex}-${col.key}`}
										className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 align-top"
									>
										{col.render
											? col.render(row)
											: String(
													getNestedValue(
														row,
														col.key
													) ?? ""
												)}
									</td>
								))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
