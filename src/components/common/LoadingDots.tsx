import React, { useEffect, useState } from 'react';

interface LoadingDotsProps {
  isLoading: boolean;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ isLoading }) => {
  const [ellipsisCount, setEllipsisCount] = useState(0);

  useEffect(() => {
    let interval: number | undefined;

    if (isLoading) {
      interval = window.setInterval(() => {
        setEllipsisCount(prev => (prev + 1) % 4);
      }, 400);
    } else {
      setEllipsisCount(0);
    }

    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [isLoading]);

  return <span>Loading{'.'.repeat(ellipsisCount)}</span>;
};

export default LoadingDots;
