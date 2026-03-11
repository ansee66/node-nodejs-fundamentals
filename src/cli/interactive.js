import readline from 'readline';
import { stdin as input, stdout as output } from 'process';

const BASE_PROMPT = "> ";
const UNKNOWN_TEXT = "Unknown command";
const END_TEXT = "Goodbye!";

const interactive = () => {
  const rl = readline.createInterface({ input, output, BASE_PROMPT });
  rl.prompt();

  rl.on('line', (input) => {
    const command = input.trim();
    switch (command) {
      case 'uptime':
        console.log(`Uptime: ${process.uptime().toFixed(2)}s`);
        break;
      case 'cwd':
        console.log(process.cwd());
        break;
      case 'date':
        console.log(new Date().toISOString());
        break;
      case 'exit':
        rl.close();
        return;
      default:
        console.log(UNKNOWN_TEXT);
    }
    rl.prompt();
  });

  rl.on("close", () => console.log(END_TEXT));
};

interactive();
