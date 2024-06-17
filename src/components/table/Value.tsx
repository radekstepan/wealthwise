import React, { useRef, useEffect } from 'react';
import CountUp from 'react-countup';

interface ValueProps {
  d: number;
}

function Value({ d }) {
  const previousValueRef = useRef(null);

  useEffect(() => {
    previousValueRef.current = d;
  }, [d]);

  return (
    <div>
      <CountUp
        start={previousValueRef.current}
        end={d}
        duration={0.2}
        separator=","
        prefix="$"
      />
    </div>
  );
}

export default Value;
