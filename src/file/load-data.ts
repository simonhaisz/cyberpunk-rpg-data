import { Data } from "../data";
import { readdirSync, lstatSync } from "fs-extra";
import { join } from "path";
import { readFile } from "./read-file";

export async function loadDirectory(dirPath: string): Promise<Data[]> {
	const data: Data[] = [];
	await loadDirectoryInner(dirPath, "", data);
	return data;
}

async function loadDirectoryInner(dirPath: string, parentPath: string, data: Data[]) {
	for (const fileName of readdirSync(dirPath)) {
		const filePath = join(dirPath, fileName)
		if (lstatSync(filePath).isFile()) {
			const values = await readFile(parentPath, filePath);
			data.push(...values);
		} else {
			await loadDirectoryInner(filePath, parentPath ? `${parentPath}.${fileName}` : fileName, data);
		}
	}
}