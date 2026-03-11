import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from "fs/promises";
import os from "os";

const dirPath = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(dirPath, '../..', 'data.json');
const workerPath = path.join(dirPath, 'worker.js');
const coresNumber = os.cpus().length;

const main = async () => {
  const data = JSON.parse(await readFile(dataPath));

  const chunkSize = Math.ceil(data.length / coresNumber);

  const workersNumber = Math.min(coresNumber, data.length / chunkSize);
  const chunks = [];
  for (let i = 0; i < workersNumber; i++) {
    chunks.push(data.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  const promises = chunks.map(chunk => {
    const promise = new Promise((resolve, reject) => {
      const worker = new Worker(workerPath);
      worker.postMessage(chunk);

      worker.on('message', (sortedArray) => {
        resolve(sortedArray);
        worker.terminate();
      });

      worker.on('error', reject);
    });

    return promise;
  })

  const sortedChunks = await Promise.all(promises);

  const mergeChunks = (chunks) => {
    const pointers = new Array(chunks.length).fill(0);
    const result = [];

    while (true) {
      let minVal = Infinity;
      let minIdx = -1;

      for (let i = 0; i < chunks.length; i++) {
        if (pointers[i] < chunks[i].length && chunks[i][pointers[i]] < minVal) {
          minVal = chunks[i][pointers[i]];
          minIdx = i;
        }
      }

      if (minIdx === -1) break;
      result.push(minVal);
      pointers[minIdx]++;
    }

    return result;
  }
  const sortedArray = mergeChunks(sortedChunks);
  console.log(sortedArray);
};

await main();
