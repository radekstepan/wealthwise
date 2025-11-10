import React, { useCallback } from 'react';
import { useAtom } from 'jotai';
import clone from 'clone-deep';
import { HiSparkles } from 'react-icons/hi';
import { formAtom } from '../../atoms/formAtom';
import { magicAppreciationAtom } from '../../atoms/magicAppreciationAtom';
import { findMagicAppreciation } from '../../modules/magicAppreciation';
import { formatCurrency } from '../../modules/magicRentSearch';

const resetState = {
  status: 'idle' as const,
  message: null,
  iteration: 0,
  diff: null,
};

const MagicAppreciationButton: React.FC = () => {
  const [form, setForm] = useAtom(formAtom);
  const [magicState, setMagicState] = useAtom(magicAppreciationAtom);

  const handleClick = useCallback(async () => {
    if (magicState.status === 'searching') {
      return;
    }

    const snapshot = clone(form);

    // Create abort controller for cancellation
    const controller = new AbortController();
    const opts = { maxIterations: 12 };

    setMagicState({
      status: 'searching',
      message: 'Finding break-even appreciation...',
      iteration: 0,
      diff: null,
      total: opts.maxIterations,
      controller,
    });

    try {
      const result = await findMagicAppreciation(
        snapshot,
        (update) => {
          setMagicState((prev) => ({
            ...prev,
            status: 'searching',
            message: update.message,
            iteration: update.iteration,
            diff: update.diff,
          }));
        },
        opts,
        controller.signal
      );

      const nextForm = clone(snapshot);
      nextForm.rates.house.appreciation[0] = result.formattedRate;

      setForm(nextForm);
      setMagicState({
        status: 'success',
        message: `Found ${result.formattedRate} (Δ ${formatCurrency(result.medianDiff)})`,
        iteration: result.iteration,
        diff: result.medianDiff,
        total: null,
        controller: null,
      });

      setTimeout(() => {
        setMagicState((prev) => (prev.status === 'success' ? resetState : prev));
      }, 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to calculate appreciation';
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
      title={magicState.message ?? 'Find the appreciation rate where buying and renting break even'}
      aria-live="polite"
    >
      <HiSparkles />
      {label}
    </button>
  );
};

export default MagicAppreciationButton;
