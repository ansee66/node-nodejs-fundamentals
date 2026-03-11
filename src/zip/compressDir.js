import { access, mkdir, readdir, stat } from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";
import { createReadStream, createWriteStream } from 'fs';
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
          files.push(fullPath);
        }
      }
    };

    await scan(sourcePath);

    const brotli = createBrotliCompress();
    const output = createWriteStream(archivePath);

    brotli.pipe(output);

    for (const file of files) {
      const relative = path.relative(sourcePath, file);
      const info = await stat(file);

      brotli.write(`PATH:${relative}\n`);
      brotli.write(`SIZE:${info.size}\n`);

      await new Promise((resolve, reject) => {
        const stream = createReadStream(file);

        stream.on("end", () => {
          brotli.write("\n");
          resolve();
        });

        stream.on("error", reject);

        stream.pipe(brotli, { end: false });
      });
    }

    brotli.end();
  } catch (err) {
    console.log('err', err);
  }
};

await compressDir();
