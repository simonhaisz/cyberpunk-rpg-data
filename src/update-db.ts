import { program } from "commander";
import { createClient } from "./db/db";
import { resolve } from "path";
import { readJsonSync } from "fs-extra";
import { insertData } from "./db/insert-data";

program
    .requiredOption("-f, --file <file>", "File with table rows")
    .requiredOption("-t, --table <table>", "Table name to insert into")
    .parse(process.argv);

const file = resolve(program.file);
const table = program.table;

(async () => {
	const values = readJsonSync(file, { encoding: "utf8" }) as any[];
	const client = await createClient();
	try {
		if (table === "system.item") {
			const transformedValues = values.map(v => transfromItemValue(v));
			await insertData(client, table, transformedValues);
		} else {
			await insertData(client, table, values);
		}
	} catch (error) {
		console.error(`Error inserting data: ${error.message}\n${error.stack}`);
	} finally {
		await client.end();
	}
})();

function transfromItemValue(value: any): { path: string, name: string, data: any } {
	const { path, props } = value;
	const data = { ...props };
	const name = data.name;
	delete data.name;
	return { path, name, data, };
}