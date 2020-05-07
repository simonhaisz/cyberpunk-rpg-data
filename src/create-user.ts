import { program } from "commander";
import { randomBytes, createHash } from "crypto";
import { insertData } from "./db/insert-data";
import { createClient } from "./db/db";

program
	.requiredOption("-u, --user <user>", "User name")
	.requiredOption("-p, --password <password>", "User password")
	.option("-a, --admin", "User is administration", false)
	.option("-gm, --game-master", "User is game master", false)
	.parse(process.argv);

const user = program.user;
const password = program.password;
const admin = program.admin;
const gameMaster = program.gameMaster;

(async () => {
	const salt = randomBytes(8).toString("hex");
	const sha256 = createHash("sha256");
	sha256.update(password+salt);
	const hash = sha256.digest("hex");

	const client = await createClient();

	try {
		const userData = [{
			"name": user,
			"password_salt": salt,
			"password_hash": hash
		}];
		
		await insertData(client, "system.user", userData);

		const permissionData: any[] = [];
		if (admin) {
			permissionData.push({
				"user_name": user,
				"name": "admin"
			});
		}
		if (gameMaster) {
			permissionData.push({
				"user_name": user,
				"name": "game_master"
			});
		}
		if (permissionData.length > 0) {
			await insertData(client, "system.permission", permissionData);
		}
	} catch (error) {
		console.error(`Error on creating user '${user}': ${error.name}\n${error.stack}`);
	} finally {
		await client.end();
	}

})();