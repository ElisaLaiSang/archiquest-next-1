import React from 'react';

interface BossTimerMessageProps {
  message: string;
}

export const BossTimerMessage: React.FC<BossTimerMessageProps> = ({ message }) => {
  return (
    <span className="rounded-lg p-2 bg-zinc-200 m-4">
      {message}
    </span>
  );
};