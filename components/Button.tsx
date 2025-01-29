// import React from 'react';

// interface ButtonProps {
//     label: string;
//     variant: 'primary' | 'secondary';
//     onClick: (e?: React.MouseEvent<HTMLButtonElement>) => void; // Allow optional event
//     disabled?: boolean;
//     icon?: React.ReactNode;
//     className?: string; // Add optional className prop
// }

// const Button: React.FC<ButtonProps> = ({
//     label,
//     variant,
//     onClick,
//     disabled = false,
//     icon,
//     className = '',
// }) => {
//     const baseClasses =
//         'flex items-center justify-center gap-2 p-3 rounded-lg text-center transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
//     const variantClasses =
//         variant === 'primary'
//             ? 'bg-green-600 text-white font-bold hover:bg-green-700 focus:ring-green-500'
//             : 'bg-gray-300 text-gray-800 font-bold hover:bg-gray-400 focus:ring-gray-300';

//     return (
//         <button
//             type="button"
//             onClick={onClick}
//             disabled={disabled}
//             className={`${baseClasses} ${variantClasses} ${
//                 disabled ? 'opacity-50 cursor-not-allowed' : ''
//             }`}
//         >
//             {icon && <span>{icon}</span>}
//             {label}
//         </button>
//     );
// };

// export default Button;

import React from 'react';

interface ButtonProps {
    label: string;
    variant: 'primary' | 'secondary';
    onClick: () => void;
    disabled?: boolean;
    icon?: React.ReactNode; // Optional icon prop
    className?: string; // Add optional className prop
}

const Button: React.FC<ButtonProps> = ({
    label,
    variant,
    onClick,
    disabled = false,
    icon,
    className = '', // Default to an empty string if no className is passed
}) => {
    const baseClasses =
        'p-4 rounded-lg text-center w-36 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClasses =
        variant === 'primary'
            ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            : 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-300';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon && <span className="mr-2">{icon}</span>}{' '}
            {/* Render the icon if provided */}
            {label}
        </button>
    );
};

export default Button;
