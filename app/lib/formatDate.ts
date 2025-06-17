export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const options: Intl.DateTimeFormatOptions = {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	};
	const formattedDate = date.toLocaleDateString("es-LA", options);
	return formattedDate;
}

export function formatDateTime(dateString: string): string {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	};
	const formattedDate = new Date(dateString).toLocaleString("es-Bo", options);
	return formattedDate;
}
