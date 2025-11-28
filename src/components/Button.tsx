interface ButtonProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  text,
  backgroundColor = '#646cff',
  textColor = '#ffffff',
  onClick,
  type = 'button',
  disabled = false,
}) => {
  return (
    <button
      className="w-full px-4 py-4 border-none rounded-xl text-base font-medium text-center cursor-pointer transition-opacity duration-200 ease-in-out font-inherit disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:opacity-80 disabled:hover:opacity-50 disabled:active:opacity-50"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;

