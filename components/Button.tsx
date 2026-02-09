
import React from 'react';
import { SoundManager } from '../utils/sound';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    SoundManager.play('ui_hover');
    props.onMouseEnter?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    SoundManager.play('ui_click');
    props.onClick?.(e);
  };

  return (
    <button
      className={`
        relative px-12 py-5 bg-white text-black font-black uppercase tracking-[0.2em]
        rounded-sm transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0.5
        shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)]
        hover:bg-blue-500 hover:text-white border-none cursor-pointer outline-none
        ${className}
      `}
      {...props}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
