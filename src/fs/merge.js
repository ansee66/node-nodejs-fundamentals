import { access, readdir, readFile, writeFile } from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";

const ERROR_TEXT = "FS operation failed";
const DEFAULT_EXT = ".txt";

const WORKSPACE_NAME = "workspace";
const PARTS_NAME = "parts";
const MERGED_NAME = "merged.txt";
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePath = path.join(rootPath, WORKSPACE_NAME);
const partsPath = path.join(workspacePath, PARTS_NAME);
const mergedPath = path.join(workspacePath, MERGED_NAME);

const merge = async () => {
  try {
    await access(partsPath);
  } catch {
    throw new Error(ERROR_TEXT);
  }

  try {
    const args = process.argv.slice(2);
    const filesIndex = args.indexOf("--files");

    let files = [];

    if (filesIndex !== -1 && args[filesIndex + 1]) {
      files = args[filesIndex + 1].split(",");

      for (const file of files) {
        try {
          await access(path.join(partsPath, file));
        } catch {
          throw new Error(ERROR_TEXT);
        }
      }
    } else {
      const entries = await readdir(partsPath, { withFileTypes: true });
      files = entries
        .filter(e => e.isFile() && path.extname(e.name) === DEFAULT_EXT)
        .map(e => e.name)
        .sort();

      if (files.length === 0) throw new Error(ERROR_TEXT);
    }

    let mergedContent = "";
    for (const file of files) {
      const filePath = path.join(partsPath, file);
      const fileContent = await readFile(filePath, "utf8");
      mergedContent += fileContent;
    }

    await writeFile(
      mergedPath,
      mergedContent
    );
  } catch (err) {
    console.log('err', err);
    throw new Error(ERROR_TEXT);
  }
};

await merge();
