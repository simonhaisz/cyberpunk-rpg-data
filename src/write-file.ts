import { join } from "path";
import { Data } from "./data";
import { writeJsonSync } from "fs-extra";

export function writeFile(dirPath: string, name: string, values: Data[]) {
    const file = join(dirPath, `${name}.json`);
    writeJsonSync(file, values, { encoding: "utf8", spaces: 4 });
}