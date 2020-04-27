import { program } from "commander";
import { resolve } from "path";
import { readJsonSync } from "fs-extra";
import { createClient, tableExists, dropTable, createTable, schemaExists, dropSchema, createSchema } from "./db/db";
import { Schema } from "./db/schema";

program
	.requiredOption("-f, --file <file>", "File with schema tables")
	.option("-os, --overwrite-schema", "Overwrite existing tables", false)
	.option("-ot, --overwrite-tables", "Overwrite existing tables", false)
	.parse(process.argv);

const file = resolve(program.file);
const overwriteSchema = program.overwriteSchema;
const overwriteTables = program.overwriteTables;

(async () => {
	const schema = readJsonSync(file, { encoding: "utf8" }) as Schema;
	const client = await createClient();
	try {
		if (await schemaExists(client, schema)) {
			if (overwriteSchema) {
				await dropSchema(client, schema);
			}
		} else {
			await createSchema(client, schema);
		}
		for (const table of schema.tables) {
			if (await tableExists(client, schema, table)) {
				if (overwriteTables) {
					console.log(`Dropping table '${table.name}' as it already exists`);
					await dropTable(client, schema, table);
				} else {
					console.log(`Skipping table '${table.name}' as it already exists`);
					continue;
				}
			}
			console.log(`Creating table '${table.name}'`);
			await createTable(client, schema, table);
		}
	} catch (error) {
		console.error(`Error creating tables: ${error.message}\n${error.stack}`);
	} finally {
		await client.end();
	}
})();