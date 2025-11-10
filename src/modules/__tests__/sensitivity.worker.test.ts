import '../sensitivity.worker.ts';
import parse from '../inputs/parse';
import { run } from '../run';

jest.mock('../inputs/parse');
jest.mock('../run');

const mockedParse = parse as jest.MockedFunction<typeof parse>;
const mockedRun = run as jest.MockedFunction<typeof run>;

describe('sensitivity.worker', () => {
  beforeEach(() => {
    mockedParse.mockReset();
    mockedRun.mockReset();
    // clear any previous listeners that importing the worker may have set
    // @ts-ignore
    self.onmessage = null;
  });

  const loadWorker = () => {
    jest.isolateModules(() => {
      require('../sensitivity.worker.ts');
    });
  };

  it('returns result for basic valid input', done => {
    // Arrange a simple deterministic simulation: last year buyer.$ - renter.$ = 10
    mockedParse.mockReturnValue({} as any);
    mockedRun.mockImplementation((parsed: any) => {
      const diff = (parsed && parsed.__diff) || 10;
      return [
        { buyer: { $: 0 }, renter: { $: 0 } },
        { buyer: { $: diff }, renter: { $: 0 } },
      ] as any;
    });

    // install worker code after mocks
    loadWorker();

    const inputs: any = {
      rate: ['1% - 5%'],
    };

    const variables = [
      { label: 'Rate', path: 'rate' },
    ];

    const messages: any[] = [];

    // @ts-ignore
    self.postMessage = (msg: any) => {
      messages.push(msg);
      if (msg.action === 'result') {
        try {
          const last = msg.result[msg.result.length - 1];
          expect(last.variable).toBe('Rate');
          expect(typeof last.s1).toBe('number');
          expect(typeof last.st).toBe('number');
          done();
        } catch (e) {
          done(e);
        }
      }
    };

    // Act
    // @ts-ignore
    self.onmessage!({ data: { inputs, variables, N_base: 2 } });
  });

  it('emits error for invalid N_base', done => {
    mockedParse.mockReturnValue({} as any);
    mockedRun.mockReturnValue([] as any);

    loadWorker();

    // @ts-ignore
    self.postMessage = (msg: any) => {
      if (msg.action === 'error') {
        expect(msg.message).toMatch(/Invalid base sample size/);
        done();
      }
    };

    // @ts-ignore
    self.onmessage!({ data: { inputs: {}, variables: [], N_base: 0 } });
  });

  it('handles no variables gracefully', done => {
    mockedParse.mockReturnValue({} as any);
    mockedRun.mockReturnValue([] as any);

    loadWorker();

    const posted: any[] = [];
    // @ts-ignore
    self.postMessage = (msg: any) => {
      posted.push(msg);
      if (msg.action === 'result') {
        try {
          expect(msg.result).toEqual([]);
          done();
        } catch (e) {
          done(e);
        }
      }
    };

    // @ts-ignore
    self.onmessage!({ data: { inputs: {}, variables: [], N_base: 2 } });
  });

  it('produces stable indices for similar sample bounds', done => {
    // We simulate two runs with nearly identical ranges and deterministic outputs
    // to verify that Sobol indices do not change drastically when inputs change slightly.

    // First scenario
    mockedParse.mockReturnValue({} as any);
    mockedRun.mockImplementation(() => [
      { buyer: { $: 0 }, renter: { $: 0 } },
      { buyer: { $: 100 }, renter: { $: 0 } },
    ] as any);

    loadWorker();

    const inputsA: any = {
      rate: ['1% - 5%'],
    };
    const variables = [{ label: 'Rate', path: 'rate' }];

    const results: any = { A: null as any, B: null as any };

    // @ts-ignore
    self.postMessage = (msg: any) => {
      if (msg.action === 'result') {
        if (!results.A) {
          results.A = msg.result;

          // Second scenario: slightly perturbed bounds
          mockedParse.mockReturnValue({} as any);
          mockedRun.mockImplementation(() => [
            { buyer: { $: 0 }, renter: { $: 0 } },
            { buyer: { $: 101 }, renter: { $: 0 } },
          ] as any);

          // reload worker to recompute based on new behavior
          loadWorker();

          const inputsB: any = {
            rate: ['1.1% - 5.1%'],
          };

          // @ts-ignore
          self.postMessage = (innerMsg: any) => {
            if (innerMsg.action === 'result') {
              results.B = innerMsg.result;
              try {
                const a = results.A[0];
                const b = results.B[0];
                expect(a.variable).toBe('Rate');
                expect(b.variable).toBe('Rate');
                const diffS1 = Math.abs(a.s1 - b.s1);
                const diffST = Math.abs(a.st - b.st);
                expect(diffS1).toBeLessThan(0.2);
                expect(diffST).toBeLessThan(0.2);
                done();
              } catch (e) {
                done(e);
              }
            }
          };

          // @ts-ignore
          self.onmessage!({ data: { inputs: inputsB, variables, N_base: 16 } });
        }
      }
    };

    // trigger first scenario
    // @ts-ignore
    self.onmessage!({ data: { inputs: inputsA, variables, N_base: 16 } });
  });
});
