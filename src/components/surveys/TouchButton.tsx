import React, { ReactNode } from 'react';

interface TouchButtonProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'option';
  disabled?: boolean;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  onClick,
  variant = 'option',
  disabled = false,
  selected = false,
  className = "",
  style
}) => {
  const baseClasses = "min-h-[48px] px-6 py-4 rounded-2xl font-medium transition-all duration-200 active:scale-95 relative overflow-hidden";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg hover:shadow-xl",
    secondary: "border-2 border-gray-300 text-gray-700 bg-white hover:border-gray-400",
    option: selected 
      ? "border-2 border-green-500 bg-green-50 text-green-700 shadow-md"
      : "border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-300 active:border-blue-400"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  const handleClick = () => {
    if (!disabled) {
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      style={style}
    >
      {children}
      
      {/* Ripple effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transform -skew-x-12 transition-opacity duration-300" />
    </button>
  );
};
