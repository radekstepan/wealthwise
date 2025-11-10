import { Random } from "random-js";
import { type TypedInputs } from "./inputs/inputs";
import parse, { type ParsedInputs } from "./inputs/parse";
import { run } from "./run";
import { type Data } from "../interfaces";
import clone from "clone-deep";
import opa from "object-path";

// --- Helper Functions ---

/**
 * A "headless" simulation runner that takes a set of parsed inputs (where each
 * leaf is a sampler function) and returns a single scalar outcome.
 * @param parsedInputs - A full set of parsed inputs for one simulation.
 * @returns The final net worth difference (Buyer - Renter).
 */
const runSimulationHeadless = (parsedInputs: ParsedInputs<TypedInputs>): number => {
  const allYearsData: Data = run(parsedInputs, false); // `run` is the existing simulation logic
  if (!allYearsData || allYearsData.length === 0) {
    return 0;
  }
  const lastYear = allYearsData[allYearsData.length - 1];
  return lastYear.buyer.$ - lastYear. renter.$;
};

/**
 * Parses a string like "1% - 5%" into a numeric tuple [0.01, 0.05].
 * Throws an error if the format is invalid.
 * @param rangeString The string to parse.
 * @returns A tuple of [min, max].
 */
const parseBounds = (rangeString: unknown): [number, number] => {
    if (typeof rangeString !== 'string') {
        throw new Error(`Invalid input type for bounds: expected string, got ${typeof rangeString}`);
    }
    const parts = rangeString.replace(/%/g, '').split(' - ');
    if (parts.length !== 2) {
        throw new Error(`Invalid range format: "${rangeString}". Expected "min% - max%".`);
    }
    const min = parseFloat(parts[0]);
    const max = parseFloat(parts[1]);
    if (isNaN(min) || isNaN(max)) {
        throw new Error(`Invalid numbers in range: "${rangeString}".`);
    }
    return [min / 100, max / 100];
};


// --- Sobol Analysis Logic ---

interface ProblemVariable {
  label: string;
  path: string;
  bounds: [number, number];
}

interface Problem {
  num_vars: number;
  variables: ProblemVariable[];
}

interface SaltelliMatrices {
    matrixA: number[][];
    matrixB: number[][];
    saltelliSamples: number[][];
}

/**
 * Generates the structured sample matrices required for Sobol analysis using Saltelli's method.
 * Note: This is a "Saltelli-like" implementation. It uses the A, B, and mixed-matrix
 * structure but employs a standard pseudo-random number generator (PRNG) instead of a
 * low-discrepancy (quasi-random) sequence like a formal Sobol sequence. This is a pragmatic
 * choice for browser environments but results in higher variance estimates.
 */
function generateSaltelliMatrices(N: number, problem: Problem): SaltelliMatrices {
  const D = problem.num_vars;
  const saltelliSamples: number[][] = [];
  const random = new Random();

  const generateMatrix = (): number[][] => {
    const matrix: number[][] = [];
    for (let i = 0; i < N; i++) {
      const row: number[] = [];
      for (let j = 0; j < D; j++) {
        const [min, max] = problem.variables[j].bounds;
        row.push(random.real(min, max));
      }
      matrix.push(row);
    }
    return matrix;
  };

  const matrixA = generateMatrix();
  const matrixB = generateMatrix();

  for (let i = 0; i < N; i++) {
    saltelliSamples.push(matrixA[i]);
    saltelliSamples.push(matrixB[i]);
    for (let j = 0; j < D; j++) {
      const mixedRow = [...matrixB[i]];
      mixedRow[j] = matrixA[i][j];
      saltelliSamples.push(mixedRow);
    }
  }
  return { matrixA, matrixB, saltelliSamples };
}

interface SobolResult {
  S1: number[];
  ST: number[];
}

/**
 * Analyzes the simulation outcomes to compute Sobol indices.
 * This function is tightly coupled with the output of `generateSaltelliMatrices`
 * and expects the outcomes array to correspond to the generated Saltelli sample rows.
 * The estimators are based on the Jansen/Saltelli formulas.
 */
function analyzeSobol(outcomes: number[], N: number, D: number): SobolResult {
  const S1 = new Array(D).fill(0);
  const ST = new Array(D).fill(0);

  // Step 1: Calculate total variance of the output cleanly.
  const mean = outcomes.reduce((a, b) => a + b, 0) / outcomes.length;
  const y_total_var = outcomes.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (outcomes.length - 1);
  
  if (y_total_var === 0) return { S1, ST }; // No variance to explain.

  // Step 2: Unpack the flat `outcomes` array back into their logical matrix results (yA, yB, yC)
  const yA: number[] = [];
  const yB: number[] = [];
  const yC: number[][] = Array.from({ length: D }, () => []);

  for (let i = 0; i < N; i++) {
    const baseIndex = i * (D + 2);
    yA.push(outcomes[baseIndex]);
    yB.push(outcomes[baseIndex + 1]);
    for (let j = 0; j < D; j++) {
      yC[j].push(outcomes[baseIndex + 2 + j]);
    }
  }

  // Step 3: Calculate indices using Jansen/Saltelli estimators
  for (let j = 0; j < D; j++) {
    let s1_numerator = 0;
    let st_numerator = 0;
    for (let i = 0; i < N; i++) {
      s1_numerator += yB[i] * (yC[j][i] - yA[i]);
      st_numerator += (yA[i] - yC[j][i]) ** 2;
    }
    S1[j] = (s1_numerator / N) / y_total_var;
    ST[j] = (st_numerator / (2 * N)) / y_total_var;
  }

  return { S1, ST };
}


// --- Worker Message Handler ---

self.onmessage = ({ data: { inputs, variables, N_base } }: { data: { inputs: TypedInputs, variables: Omit<ProblemVariable, 'bounds'>[], N_base: number } }) => {
  try {
    if (!N_base || N_base <= 1) {
        throw new Error(`Invalid base sample size N_base: ${N_base}. Must be greater than 1.`);
    }

    const problem: Problem = {
      num_vars: variables.length,
      variables: variables.map(v => ({
        ...v,
        bounds: parseBounds(opa.get(inputs, `${v.path}.0`))
      }))
    };
    
    // If there are no variables with ranges, there's nothing to analyze.
    if (problem.num_vars === 0) {
      self.postMessage({ action: 'result', result: [] });
      return;
    }

    const { saltelliSamples } = generateSaltelliMatrices(N_base, problem);
    const totalRuns = saltelliSamples.length;
    const baseParsedInputs = parse(inputs);

    const outcomes = saltelliSamples.map((sampleRow, index) => {
      const runParsedInputs = clone(baseParsedInputs);
      problem.variables.forEach((v, i) => {
        // The simulation engine expects a tree of sampler *functions*.
        // Here, we replace the default sampler function (e.g., a normal distribution)
        // with a new function that deterministically returns the value for this specific run.
        opa.set(runParsedInputs, v.path, () => sampleRow[i]);
      });

      const result = runSimulationHeadless(runParsedInputs);
      
      if (index % 10 === 0) {
        self.postMessage({ action: 'progress', progress: (index + 1) / totalRuns });
      }

      return result;
    });

    const analysisResult = analyzeSobol(outcomes, N_base, problem.num_vars);
    
    self.postMessage({ action: 'progress', progress: 1.0 }); // Ensure completion message is sent

    const finalReport = problem.variables.map((v, i) => {
      // Small negative values can occur due to Monte Carlo noise.
      // Clamp tiny negatives, but allow larger ones through as they may indicate an issue.
      const clamp = (val: number) => (val < 0 && val > -1e-6) ? 0 : val;
      return {
        variable: v.label,
        s1: clamp(analysisResult.S1[i]),
        st: clamp(analysisResult.ST[i]),
      };
    });

    self.postMessage({ action: 'result', result: finalReport });

  } catch (error) {
    self.postMessage({ action: 'error', message: error instanceof Error ? error.message : 'An unknown error occurred in the sensitivity worker.' });
  }
};
