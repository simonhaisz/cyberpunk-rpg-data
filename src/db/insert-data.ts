import { Client } from "pg";
import { convertToTableData } from "./convert-data";
import { TableData } from "../data";

export async function insertData(client: Client, table: string, values: any[]) {
	if (values.length === 0) {
		throw new Error(`No data provided to be inserted`);
	}
	const tableData = convertToTableData(values);
	await insertDataRows(client, table, tableData)
}

async function insertDataRows(client: Client, table: string, data: TableData) {
	const { columns, rows } = data;
	const q = `
INSERT INTO ${table} (${columns.join(", ")})
VALUES
${rows.map(r => `(${r.join(", ")})`).join(",\n")}
;
	`.trim();

	try {
		await client.query(q);
	} catch (error) {
		throw error;
	}
}