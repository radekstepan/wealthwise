import React, { useCallback } from 'react';
import { useAtom } from 'jotai';
import clone from 'clone-deep';
import { HiSparkles } from 'react-icons/hi';
import { formAtom } from '../../atoms/formAtom';
import { magicRentAtom } from '../../atoms/magicRentAtom';
import { findMagicRent, formatCurrency } from '../../modules/magicRent';

const resetState = {
  status: 'idle' as const,
  message: null,
  iteration: 0,
  diff: null,
};

const MagicRentButton: React.FC = () => {
  const [form, setForm] = useAtom(formAtom);
  const [magicState, setMagicState] = useAtom(magicRentAtom);

  const handleClick = useCallback(async () => {
    if (magicState.status === 'searching') {
      return;
    }

    const snapshot = clone(form);

    // Create abort controller for cancellation
    const controller = new AbortController();
    const opts = { maxIterations: 12, maxExpansionSteps: 6 };

    setMagicState({
      status: 'searching',
      message: 'Searching for break-even rent…',
      iteration: 0,
      diff: null,
      total: opts.maxIterations,
      controller,
    });

    try {
      const result = await findMagicRent(snapshot, (update) => {
        setMagicState((prev) => ({
          status: 'searching',
          message: update.message,
          iteration: update.iteration,
          diff: update.diff,
          total: prev.total,
          controller: prev.controller,
        }));
      }, opts, controller.signal);

      const nextForm = clone(snapshot);
      nextForm.rent.current[0] = result.formattedRent;
      nextForm.rent.market[0] = result.formattedRent;

      setForm(nextForm);
      setMagicState({
        status: 'success',
        message: `Found ${result.formattedRent} (Δ ${formatCurrency(result.medianDiff)})`,
        iteration: result.iteration,
        diff: result.medianDiff,
        total: null,
        controller: null,
      });

      setTimeout(() => {
        setMagicState((prev) => (prev.status === 'success' ? resetState : prev));
      }, 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to calculate rent';
      setMagicState({
        status: 'error',
        message,
        iteration: 0,
        diff: null,
        total: null,
        controller: null,
      });

      setTimeout(() => {
        setMagicState((prev) => (prev.status === 'error' ? resetState : prev));
      }, 5000);
    }
  }, [form, magicState.status, setForm, setMagicState]);

  const isRunning = magicState.status === 'searching';
  const label = isRunning ? 'Finding…' : 'Find';

  return (
    <button
      type="button"
      className="magic-rent-button"
      onClick={handleClick}
      disabled={isRunning}
      title={magicState.message ?? 'Find the rent value where renting and buying break even'}
      aria-live="polite"
    >
      <HiSparkles />
      {label}
    </button>
  );
};

export default MagicRentButton;
