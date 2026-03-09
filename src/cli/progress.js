const DEFAULT_DURATION = 5000;
const DEFAULT_INTERVAL = 100;
const DEFAULT_LENGTH = 30;
const END_TEXT = "\nDone!";

const progress = () => {
  const args = process.argv.slice(2);

  const getArg = (argName, defaultValue) => {
    const argIndex = args.indexOf(argName);
    if (argIndex !== -1 && args[argIndex + 1]) {
      const value = args[argIndex + 1];
      if (argName === "--color") {
        const valid = /^#[0-9A-Fa-f]{6}$/.test(value);
        if (valid) {
          const r = parseInt(value.slice(1, 3), 16);
          const g = parseInt(value.slice(3, 5), 16);
          const b = parseInt(value.slice(5, 7), 16);

          return `\x1b[38;2;${r};${g};${b}m`;
        }
      } else {
        return isNaN(Number(value)) ? defaultValue : Number(value)
      }
    }

    return defaultValue;
  }

  let length = getArg("--length", DEFAULT_LENGTH);
  let interval = getArg("--interval", DEFAULT_INTERVAL);
  let duration = getArg("--duration", DEFAULT_DURATION);
  let color = getArg("--color", null);

  const steps = Math.ceil(duration / interval);
  let currentStep = 0;

  const intervalId = setInterval(() => {
    currentStep++;
    const percent = Math.min(Math.round((currentStep / steps) * 100), 100);
    const filledLength = Math.round(percent * length / 100);

    const filled = "█".repeat(filledLength);
    const empty = " ".repeat(length - filledLength);

    let bar;

    if (color) {
      bar = `[${color}${filled}\x1b[0m${empty}] ${percent}%`;
    } else {
      bar = `[${filled}${empty}] ${percent}%`;
    }

    process.stdout.write("\r" + bar);

    if (percent >= 100) {
      clearInterval(intervalId);
      process.stdout.write(END_TEXT);
    }
  }, interval);
};

progress();
