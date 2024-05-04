import React, { useState, useEffect } from 'react';

type CountdownTimerProps = {
  initialTime: number;
  onTimerEnd: () => void;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ initialTime, onTimerEnd }) => {
  const [timeLeft, setTimeLeft] = useState<number>(initialTime);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft === 0) {
            clearInterval(timer);
            onTimerEnd();
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    } else {
      onTimerEnd();
    }

    return () => clearInterval(timer);
  }, [timeLeft, onTimerEnd]);

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return <div>{formatTime(timeLeft)}</div>;
};

export default CountdownTimer;