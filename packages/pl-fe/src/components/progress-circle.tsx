import clsx from 'clsx';
import React from 'react';

interface IProgressCircle {
  progress: number;
  radius?: number;
  stroke?: number;
  title?: string;
}

const ProgressCircle: React.FC<IProgressCircle> = ({
  progress,
  radius = 12,
  stroke = 4,
  title,
}) => {
  const progressStroke = stroke + 0.5;
  const actualRadius = radius + progressStroke;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <div title={title}>
      <svg
        width={actualRadius * 2}
        height={actualRadius * 2}
        viewBox={`0 0 ${actualRadius * 2} ${actualRadius * 2}`}
      >
        <circle
          className='stroke-gray-500 dark:stroke-white/20'
          cx={actualRadius}
          cy={actualRadius}
          r={radius}
          fill='none'
          strokeWidth={stroke}
        />
        <circle
          className={clsx('stroke-primary-500', {
            'stroke-secondary-500': progress > 1,
          })}
          style={{
            strokeDashoffset: dashoffset,
            strokeDasharray: circumference,
          }}
          cx={actualRadius}
          cy={actualRadius}
          r={radius}
          fill='none'
          strokeWidth={progressStroke}
          strokeLinecap='round'
        />
      </svg>
    </div>
  );
};

export { ProgressCircle as default };
