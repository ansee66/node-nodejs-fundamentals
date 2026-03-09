import { readdir, readFile, stat, writeFile } from "fs/promises";
import { fileURLToPath } from 'url';
import path from "path";

const WORKSPACE_NAME = "workspace";
const FILE_NAME = "snapshot.json";
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const workspacePath = path.join(rootPath, WORKSPACE_NAME);

const snapshot = async () => {

  try {
    const entries = [];

    const scan = async (dir) => {
      const files = await readdir(dir, { withFileTypes: true });

      for (const entry of files) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(workspacePath, fullPath);

        if (entry.isDirectory()) {
          entries.push({
            path: relativePath,
            type: "directory",
          });

          await scan(fullPath);
        }

        if (entry.isFile()) {
          const statInfo = await stat(fullPath);
          const contentBuffer = await readFile(fullPath);

          entries.push({
            path: relativePath,
            type: "file",
            size: statInfo.size,
            content: contentBuffer.toString("base64"),
          });
        }
      }
    };

    await scan(workspacePath);

    const result = {
      workspacePath,
      entries
    };

    await writeFile(
      path.join(rootPath, FILE_NAME),
      JSON.stringify(result, null, 2)
    );

  } catch (err) {
    console.log('err', err);
    throw new Error("FS operation failed");
  }
};

await snapshot();
