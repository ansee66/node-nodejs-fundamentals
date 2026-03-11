import { Transform } from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let buffer = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      let text = chunk.toString();
      text = text.replace(/\\n/g, "\n");

      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      const numberedLines = lines.map((line) => `${lineNumber++} | ${line}`).join("\n");

      callback(null, numberedLines + "\n");
    },
    flush(callback) {
      if (buffer.length > 0) {
        this.push(`${lineNumber++} | ${buffer}\n`);
      }
      callback();
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
