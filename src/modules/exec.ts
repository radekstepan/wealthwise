const worker = new Worker(new URL('./run.ts', import.meta.url));

export default inputs => new Promise(resolve => {
  worker.postMessage({inputs});

  worker.onmessage = ({data: {res}}) => {
    resolve(res);
  };
});
