import { fileURLToPath, pathToFileURL } from 'url';
import path from "path";

const DIR_NAME = "plugins";
const workspacePath = path.join(path.dirname(fileURLToPath(import.meta.url)));

const dynamic = async () => {
  const pluginName = process.argv[2];
  const pluginPath = path.join(workspacePath, DIR_NAME, `${pluginName}.js`);

  try {
    const plugin = await import(pathToFileURL(pluginPath));
    const result = plugin.run();
    console.log(result);
  } catch (err) {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
