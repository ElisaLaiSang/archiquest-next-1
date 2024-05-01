import React, { useState, useEffect } from 'react';

interface TimerProps {
  onTimerUpdate?: (time: number) => void;
}

const Timer: React.FC<TimerProps> = ({ onTimerUpdate }) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        const newTimer = prevTimer + 1;
        if (onTimerUpdate) {
          onTimerUpdate(newTimer);
        }
        return newTimer;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [onTimerUpdate]);

  return <span>{timer} seconds</span>;
};

export default Timer;