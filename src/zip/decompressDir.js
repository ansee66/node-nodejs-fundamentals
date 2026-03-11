import { access, mkdir, readFile, writeFile } from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";
import { brotliDecompressSync } from "zlib";

const ERROR_TEXT = "FS operation failed";
const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePath = path.join(rootPath, "workspace");
const sourcePath = path.join(workspacePath, "compressed", "archive.br");
const targetDirPath = path.join(workspacePath, "decompressed");

const decompressDir = async () => {
  try {
    await access(sourcePath);
  } catch {
    throw new Error(ERROR_TEXT);
  }

  try {
    await mkdir(targetDirPath, { recursive: true });

    const archiveBuffer = await readFile(sourcePath);
    const jsonBuffer = brotliDecompressSync(archiveBuffer);
    const files = (await JSON.parse(jsonBuffer)).files;

    for (const file of files) {
      const targetPath = path.join(targetDirPath, file.path);
      await mkdir(path.dirname(targetPath), {recursive: true});

      await writeFile(targetPath, Buffer.from(file.content, "base64"));
    }
  } catch (err) {
    console.log('err', err);
  }
};

await decompressDir();
