import { Client } from "pg";
import { config } from "dotenv";
import { Table, ColumnType, Column, Schema } from "./schema";

export async function createClient(): Promise<Client> {
	ensureEnvironmentLoaded();
	const client = new Client();
	await client.connect();
	return client;
}

let environmentLoaded = false;

function ensureEnvironmentLoaded() {
	if (!environmentLoaded) {
		config();
	}
}

export async function createSchema(client: Client, schema: Schema) {
	const q = `
		CREATE SCHEMA ${schema.name}
	`;
	await client.query(q);
}

export async function schemaExists(client: Client, schema: Schema) {
	const q = `
		SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${schema.name}';
	`;
	const result = await client.query(q);
	return result.rowCount > 0;
}

export async function dropSchema(client: Client, schema: Schema) {
	const q = `
DROP SCHEMA ${schema.name};
	`.trim();
	await client.query(q);
}

export async function createTable(client: Client, schema: Schema, table: Table) {
	const { name, columns } = table;
	const q = `
CREATE TABLE ${schema.name}.${name} (
	${columns.map(c => constructCreateColumnExpression(c)).join(",\n\t")},
	PRIMARY KEY (${columns.filter(c => c.key).map(c => c.name)})
);
	`.trim();
	await client.query(q);
}

function constructCreateColumnExpression(column: Column) {
	const { name, type, allowNull=false, constraints } = column;
	let expression = `${name} ${convertTypeToExpression(type)}`;
	if (!allowNull) {
		expression += " NOT NULL";
	}
	if (constraints) {
		expression += ` CHECK(${constraints})`;
	}
	return expression;
}

function convertTypeToExpression(type: ColumnType): string {
	switch (type) {
		case ColumnType.Boolean:
			return "boolean";
		case ColumnType.Float:
			return "float";
		case ColumnType.Integer:
			return "int";
		case ColumnType.JSON:
			return "json";
		case ColumnType.String:
			return "varchar(100)";
		case ColumnType.Text:
			return "text";
	}
}

export async function tableExists(client: Client, schema: Schema, table: Table): Promise<boolean> {
	const q = `
SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema='${schema.name}' AND table_name='${table.name}';
	`.trim();
	const result = await client.query(q);
	return result.rowCount > 0;
}

export async function dropTable(client: Client, schema: Schema, table: Table) {
	const q = `
DROP TABLE ${schema.name}.${table.name};
	`.trim();
	await client.query(q);
}