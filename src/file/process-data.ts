import { Data } from "../data";

export function processData(allData: Data[]): Data[] {
	const processedData: Data[] = [];
	for (const data of allData) {
		if (/^([\w-\s]+)\s+\(([\w-\s]+(,\s*)?)+\)$/i.test(data.props.name)) {
			processedData.push(...splitData(data));
		} else {
			processedData.push(data);
		}
	}
	return processedData;
}

function splitData(data: Data): Data[] {
	const { path, props } = data;
	const versions: Data[] = [];
	const groupResult = /^([\w-\s]+)\s+\(((?:(?:[\w-\s]+)(?:,\s*)?)+)\)$/i.exec(props.name);
	if (!groupResult) {
		throw new Error(`Data's name property does not contain multiple versions`);
	}
	const groupName = groupResult[1];
	const versionNames = groupResult[2].split(",").map(r => r.trim());
	const versionCount = versionNames.length;
	for (let i = 0; i < versionCount; i++) {
		const versionProps: any = {};
		versionProps.name = `${groupName} - ${versionNames[i]}`;
		for (const propName of Object.keys(props)) {
			if (propName === "name") {
				// skip name - it is already set
				continue;
			}
			// all other properties are strings
			const propValue = props[propName] as string;
			const splitValues = propValue.split(",").map(v => v.trim());
			if (splitValues.length === 1) {
				// same value for all versions
				versionProps[propName] = propValue;
			} else if (splitValues.length === versionCount) {
				versionProps[propName] = splitValues[i];
			} else {
				throw new Error(`Properties should have a single value or the same amount as there are version names ${versionCount} - found ${splitValues.length}`);
			}
		}
		versions.push({ path, props: versionProps });
	}
	return versions;
}