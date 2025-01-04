import React from 'react';

interface ButtonProps {
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode; // Optional icon prop
}

const Button: React.FC<ButtonProps> = ({
    label,
    variant,
    onClick,
    disabled = false,
    icon,
}) => {
    const baseClasses =
        'flex items-center justify-center gap-2 p-3 rounded-lg text-center transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses =
        variant === 'primary'
            ? 'bg-green-600 text-white font-bold hover:bg-green-700 focus:ring-green-500'
            : 'bg-gray-300 text-gray-800 font-bold hover:bg-gray-400 focus:ring-gray-300';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    );
};

export default Button;
