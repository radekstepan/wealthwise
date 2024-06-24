import EventEmitter from 'events';
import { type TypedInputs } from './inputs/inputs';
const worker = new Worker(new URL('./run.ts', import.meta.url));

// A utility for running code in a separate thread and emitting
//  events when certain messages are received from the Worker object.
export default function exec(inputs: TypedInputs) {
  const evt = new EventEmitter();

  worker.postMessage({inputs});

  worker.onmessage = ({data}) => {
    switch (data.action) {
      case 'meta':
        evt.emit('meta', data.meta);
        break;
      case 'res':
        evt.emit('res', data.res);
        break;
    }
  };

  return evt;
}
