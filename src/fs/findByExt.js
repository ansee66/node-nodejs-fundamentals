import { access, readdir } from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";

const ERROR_TEXT = "FS operation failed";
const DEFAULT_EXT = ".txt";

const WORKSPACE_NAME = "workspace";
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePath = path.join(rootPath, WORKSPACE_NAME);

const findByExt = async () => {
  try {
    await access(workspacePath);
  } catch {
    throw new Error(ERROR_TEXT);
  }

  try {
    const args = process.argv.slice(2);
    let ext = DEFAULT_EXT;
    const extIndex = args.indexOf("--ext");
    if (extIndex !== -1 && args[extIndex + 1]) {
      ext = args[extIndex + 1].startsWith(".") ? args[extIndex + 1] : `.${args[extIndex + 1]}`;
    }

    const result = [];

    const scan = async (dir) => {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scan(fullPath);
        }

        if (entry.isFile()) {
          const fileExt = path.extname(entry.name);

          if (fileExt === ext) {
            const relativePath = path.relative(workspacePath, fullPath);
            result.push(relativePath);
          }
        }
      }
    }
    
    await scan(workspacePath);

    result.sort();

    for (const file of result) {
      console.log(file);
    }
  } catch (err) {
    console.log('err', err);
  }
};

await findByExt();
