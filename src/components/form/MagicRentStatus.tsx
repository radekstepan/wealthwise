import React from 'react';
import { useAtomValue } from 'jotai';
import { magicRentAtom } from '../../atoms/magicRentAtom';

const statusClassName: Record<string, string> = {
  idle: '',
  searching: 'field__status--searching',
  success: 'field__status--success',
  error: 'field__status--error',
};

export const MagicRentStatus: React.FC = () => {
  const magicState = useAtomValue(magicRentAtom);

  if (!magicState.message) {
    return null;
  }

  const cls = ['field__status'];
  const extra = statusClassName[magicState.status];
  if (extra) {
    cls.push(extra);
  }

  return (
    <div className={cls.join(' ')} role={magicState.status === 'error' ? 'alert' : 'status'}>
      {magicState.message}
    </div>
  );
};
