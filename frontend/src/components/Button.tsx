import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'foreground' | 'accent';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  icon?: string;
  iconSize?: string;
  size?: 'base' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  icon,
  iconSize = 'w-6 h-6',
  size = 'lg',
}) => {
  const baseStyles = 'w-full max-w-md mx-auto py-3 rounded-full font-medium transition-opacity';
  
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90 active:opacity-80',
    foreground: 'bg-foreground text-background hover:opacity-90 active:opacity-80',
    accent: 'bg-accent text-accent-foreground hover:opacity-90 active:opacity-80',
  };
  
  const sizeStyles = {
    base: 'text-base',
    lg: 'text-lg',
  };
  
  const disabledStyles = disabled 
    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
    : variantStyles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${disabledStyles} ${icon ? 'flex items-center justify-center gap-3' : ''} ${className}`}
    >
      {icon && <img src={icon} alt="" className={iconSize} />}
      {children}
    </button>
  );
};

export default Button;

