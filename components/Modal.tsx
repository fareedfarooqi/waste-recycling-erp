import React from 'react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    variant?: 'default' | 'delete'; // Add a variant prop
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    variant = 'default',
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div
                className={`p-6 relative flex flex-col rounded-md shadow-md max-w-xl w-full
                ${variant === 'delete' ? 'bg-red-50 border border-red-500' : 'bg-white'}
            `}
            >
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
