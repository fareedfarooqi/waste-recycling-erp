import React from 'react';

type ButtonProps = {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
};

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
    buttons: ButtonProps[];
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    isOpen,
    onClose,
    title,
    content,
    buttons,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-gray-700 bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div
                className="bg-white w-[90%] max-w-xl rounded-md p-6 font-sans shadow-lg relative"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="font-bold text-lg mb-4 text-center">{title}</h3>
                <div className="mb-6 text-center">{content}</div>
                <div className="flex justify-between space-x-4">
                    {buttons.map((button, index) => (
                        <button
                            key={index}
                            onClick={button.onClick}
                            className={`font-bold p-4 rounded-lg text-center w-36 transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${button.variant === 'primary' ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' : 'bg-gray-300 text-gray-800 hover:bg-gray-400 focus:ring-gray-300'}`}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
