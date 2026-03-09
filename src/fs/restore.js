import { readFile, writeFile, mkdir, access } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const SNAPSHOT_NAME = "snapshot.json";
const RESTORED_DIR = "workspace_restored";
const ERROR_TEXT = "FS operation failed";

const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const snapshotPath = path.join(rootPath, SNAPSHOT_NAME);
const restoredPath = path.join(rootPath, RESTORED_DIR);

const doesExist = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const restore = async () => {
  if (!(await doesExist(snapshotPath))) {
    throw new Error(ERROR_TEXT);
  }

  if (await doesExist(restoredPath)) {
    throw new Error(ERROR_TEXT);
  }

  try {
    const snapshotContent = await readFile(snapshotPath, "utf8");
    const snapshot = JSON.parse(snapshotContent);

    const { entries } = snapshot;
    for (const entry of entries) {
      const targetPath = path.join(restoredPath, entry.path);
      if (entry.type === "directory") {
        await mkdir(targetPath, {recursive: true});
      }
      if (entry.type === "file") {
        await mkdir(path.dirname(targetPath), { recursive: true });
        const buffer = Buffer.from(entry.content, "base64");
        await writeFile(targetPath, buffer);
      }
    }
  } catch (err) {
    console.log('err', err);
  }
};

await restore();
