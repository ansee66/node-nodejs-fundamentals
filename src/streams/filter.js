import { Transform } from "stream";

const filter = () => {
  // Write your code here
  // Read from process.stdin
  // Filter lines by --pattern CLI argument
  // Use Transform Stream
  // Write to process.stdout
  const args = process.argv.slice(2);
  let pattern = '';
  const patternIndex = args.indexOf("--pattern");
  if (patternIndex !== -1 && args[patternIndex + 1]) {
    pattern = args[patternIndex + 1];
  }

  let buffer = "";

  const transformer = new Transform({
    transform(chunk, encoding, callback) {
      let text = chunk.toString();
      text = text.replace(/\\n/g, "\n");

      buffer += text;
      const lines = buffer.split("\n");
      buffer = lines.pop();

      let filtered = lines.filter(line => line.includes(pattern)).join("\n");

      callback(null, filtered ? filtered + "\n" : "");
    },

    flush(callback) {
      if (buffer.length > 0 && buffer.includes(pattern)) {
        this.push(buffer);
      }
      callback();
    }
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();
