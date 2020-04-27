import { program } from "commander";
import { readdirSync, existsSync, lstatSync } from "fs-extra";
import { join, resolve } from "path";
import { loadDirectory } from "./file/load-data";
import { processData } from "./file/process-data";
import { writeFile } from "./file/write-file";

program
    .requiredOption("-d, --root-dir <dir>", "Root directory for data files")
    .option("-o, --overwrite", "Overwrite existing output json files", false)
    .parse(process.argv);

const rootDir = resolve(program.rootDir);
const overwrite = program.overwrite;

(async () => {
	for (const fileName of readdirSync(rootDir)) {
		const file = join(rootDir, fileName)
		if (lstatSync(file).isFile()) {
			continue;
		}
		const outputFile = join(rootDir,`${fileName}.json`);
		if (existsSync(outputFile) && !overwrite) {
			console.log(`Skipping '${fileName}' as it has already been converted`);
			continue;
		}
		const data = processData(await loadDirectory(file));
		writeFile(rootDir, fileName, data);
	}
})();