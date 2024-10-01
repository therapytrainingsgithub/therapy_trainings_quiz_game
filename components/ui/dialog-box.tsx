import React, { useState, FC } from 'react';
import { Button } from './button';

interface DialogBoxProps {
  message: string;
  onConfirm: () => void;
}

const DialogBox: FC<DialogBoxProps> = ({ message, onConfirm }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <p className="mb-4 text-gray-800">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-500 hover:bg-green-700"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DialogBox;
