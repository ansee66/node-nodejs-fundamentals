import { log } from "console";
import { readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";

const WORKSPACE_NAME = "workspace";
const FILE_NAME = "snapshot.json";

const snapshot = async () => {

  try {
    const rootPath = path.resolve(WORKSPACE_NAME);
    //console.log('rootPath', rootPath);
    const entries = [];

    const scan = async (dir) => {
      const files = await readdir(dir, { withFileTypes: true });
      //console.log('files', files);

      for (const entry of files) {
        const fullPath = path.join(dir, entry.name);
        //console.log('fullPath', fullPath);
        const relativePath = path.relative(rootPath, fullPath);
        //console.log('relativePath', relativePath);

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

    await scan(rootPath);

    const result = {
      rootPath,
      entries
    };

    await writeFile(
      FILE_NAME,
      JSON.stringify(result, null, 2)
    );

  } catch (err) {
    console.log('err', err);
    throw new Error("FS operation failed");
  }
};

await snapshot();
