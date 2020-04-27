import { createReadStream } from "fs-extra";
import { basename, extname } from "path";
import { createInterface } from "readline";
import { camelCase } from "change-case";
import { Data } from "../data";

type LineReader = (line: string) => string[];

const tabReader: LineReader = (line: string) => line.split("\t");

export async function readFile(parentPath: string, filePath: string): Promise<Data[]> {
    return new Promise<Data[]>((resolve, reject) => {
        const extension = extname(filePath);
        let lineReader: LineReader;
        switch (extension) {
            case ".tab":
                lineReader = tabReader;
                break;
            default:
                reject(new Error(`Unsupported extension '${extension}' type`));
		}
		const path = `${parentPath}.${basename(filePath, extension)}`;
        const names: string[] = [];
        const values: Data[] = [];
        const reader = createInterface(createReadStream(filePath))
        reader.on("line", line => {
            if (!line) {
                // skip empty lines
                return;
            }
            if (names.length === 0) {
                // header row
                names.push(...lineReader(line).map(v => camelCase(v)));
            } else {
                // data
                let i = 0;
                let props: any = {};
                for (const data of lineReader(line)) {
                    props[names[i++]] = data;
                }
                values.push({ path, props });
            }
        });
        reader.on("close", () => {
            resolve(values);
        });
        reader.on("error", error => {
            reject(error);
        })
    });
}