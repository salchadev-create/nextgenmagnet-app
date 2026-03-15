import React from 'react';

interface DividerProps {
  text?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = 'or' }) => {
  return (
    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-800"></div>
      <span className="px-4 text-xs font-medium text-gray-500 uppercase tracking-widest">{text}</span>
      <div className="flex-grow border-t border-gray-800"></div>
    </div>
  );
};
