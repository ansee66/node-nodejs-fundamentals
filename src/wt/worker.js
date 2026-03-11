import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
  if (!Array.isArray(data)) {
    parentPort.postMessage({ error: "Data is not array" });
    return;
  }

  const sorted = data.sort((a, b) => a - b);
  parentPort.postMessage(sorted);
});
