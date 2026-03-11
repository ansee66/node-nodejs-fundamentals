import { createReadStream, writeFileSync } from 'fs';
import path from "path";
import { fileURLToPath } from 'url';

const SOURCE_NAME = "source.txt";
const DEFAULT_LINES_NUMBER = 10;
const rootPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePath = path.join(rootPath, SOURCE_NAME);

const split = async () => {
  try {
    const args = process.argv.slice(2);
    let linesPerChunk = DEFAULT_LINES_NUMBER;
    const linesIndex = args.indexOf("--lines");
    if (linesIndex !== -1 && args[linesIndex + 1] && !isNaN(Number(args[linesIndex + 1]))) {
      linesPerChunk = Number(args[linesIndex + 1]);
    }

    let buffer = "";
    let chunkLines = [];
    let chunkIndex = 1;

    const stream = createReadStream(sourcePath, { encoding: "utf8" });
    stream.on('data', (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        chunkLines.push(line);
        if (chunkLines.length === linesPerChunk) {
          writeFileSync(
            `chunk_${chunkIndex}.txt`,
            chunkLines.join("\n")
          );

          chunkIndex++;
          chunkLines = [];
        }
      }

    });
    
    stream.on('end', () => {
      if (buffer) {
        chunkLines.push(buffer);
      }

      if (chunkLines.length > 0) {
        writeFileSync(
          `chunk_${chunkIndex}.txt`,
          chunkLines.join("\n")
        );
      }
    });

  } catch (err) {
    console.log('err', err);
  }
};

await split();
