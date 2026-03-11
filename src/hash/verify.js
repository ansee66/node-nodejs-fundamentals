import { access, readFile } from "fs/promises";
import { createReadStream } from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import { createHash } from "crypto";

const ERROR_TEXT = "FS operation failed";
const SOURCE_NAME = "checksums.json";
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = path.join(rootPath, SOURCE_NAME);

const verify = async () => {
  try {
    await access(sourcePath);
  } catch {
    throw new Error(ERROR_TEXT);
  }

  try {
    const data = await readFile(sourcePath);
    const checksums = JSON.parse(data);

    const entries = Object.entries(checksums);
    for (const [filename, expectedHash] of entries) {
      const filePath = path.join(rootPath, filename);

      try {
        await access(filePath);
      } catch {
        console.log(`${filename} — FAIL`);
        continue;
      }

      const hash = createHash("sha256");

      await new Promise((resolve,reject) => {
        const stream = createReadStream(filePath);
        stream.on("data", (chunk) => {
          hash.update(chunk);
        })

        stream.on("end", () => {
          const actualHash = hash.digest("hex");
          const result = expectedHash === actualHash ? "OK" : "FAIL";
          console.log(`${filename} — ${result}`);
          resolve();
        })

        stream.on("error", () => {
          reject();
        })
      })

    }
  } catch (err) {
    console.log('err', err);
  }
};

await verify();
