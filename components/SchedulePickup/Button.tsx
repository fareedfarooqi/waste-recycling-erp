import React from 'react';

type ButtonProps = {
    label: string | React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary';
    children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
    label,
    variant,
    onClick,
    disabled,
    className,
}) => {
    const baseClasses =
        'p-4 rounded-lg text-center w-36 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses =
        variant === 'primary'
            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            : 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-300';
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {label}
        </button>
    );
};

export default Button;
