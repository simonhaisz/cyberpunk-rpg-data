import { TableData } from "../data";
import { isArray, isObject } from "util";

export function convertToTableData(values: any[]): TableData {
	const columns: string[] = [];
	const rows: any[][] = [];
	if (values.length > 0) {
		// take the columns in the order of the first object
		for (const propName in values[0]) {
			columns.push(propName);
		}
		for (const value of values) {
			const row: any[] = [];
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i];
				row.push(convertToTableValue(value[column]));
			}
			rows.push(row);
		}
	}
	
	return { columns, rows };
}

function convertToTableValue(value: any): string {
	if (isArray(value)) {
		throw new Error(`Array values are not supported for insert`);
	}
	// JSON needs to be quoted like any 'string' value
	if (isObject(value)) {
		return `'${escapeQuotes(JSON.stringify(value))}'`;
	}
	//all scalar values are text (for now) so always quote the value
	return `'${escapeQuotes(value)}'`;
}

function escapeQuotes(value: string): string {
	return value.replace(/'/g, "''");
}