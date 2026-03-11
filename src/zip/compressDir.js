import { access, mkdir, readdir, readFile } from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { createBrotliCompress } from "zlib";

const ERROR_TEXT = "FS operation failed";
const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePath = path.join(rootPath, "workspace");
const sourcePath = path.join(workspacePath, "toCompress");
const targetDirPath = path.join(workspacePath, "compressed");
const archivePath = path.join(targetDirPath, "archive.br");

const compressDir = async () => {
  try {
    await access(sourcePath);
  } catch {
    throw new Error(ERROR_TEXT);
  }

  try {
    await mkdir(targetDirPath, { recursive: true });
    const files = [];

    const scan = async (dir) => {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        }

        if (entry.isFile()) {
          const content = await readFile(fullPath);

          files.push({
            path: path.relative(sourcePath, fullPath),
            content: content.toString("base64"),
          });
        }
      }
    };

    await scan(sourcePath);

    const json = JSON.stringify({ files });
    const input = Readable.from([json]);

    const brotli = createBrotliCompress();
    const output = createWriteStream(archivePath);

    input.pipe(brotli).pipe(output);
  } catch (err) {
    console.log('err', err);
  }
};

await compressDir();
