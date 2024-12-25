const isTest = process.env.NODE_ENV === 'test';

type WWPostMessage = typeof ServiceWorker.prototype.postMessage;
type WPostMessage = typeof Window.prototype.postMessage;

export const postMessage: WWPostMessage | WPostMessage = (message: any) => {
  if (isTest) {
    self.postMessage(message, '*'); // window
  } else {
    self.postMessage(message); // worker
  }
};
