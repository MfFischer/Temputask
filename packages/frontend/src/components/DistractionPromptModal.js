// src/components/DistractionPromptModal.js
import React, { useState } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import { useFocusContext } from '../contexts/FocusContext';

const DistractionPromptModal = () => {
  const { showDistractedPrompt, handleDistractionLogged, closeDistractedPrompt } = useFocusContext();
  const [description, setDescription] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    handleDistractionLogged(description);
    setDescription('');
  };
  
  return (
    <Modal
      isOpen={showDistractedPrompt}
      onClose={closeDistractedPrompt}
      title="What distracted you?"
    >
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Logging your distractions helps you identify patterns and improve your focus habits.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="distraction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Distraction
            </label>
            <input
              type="text"
              id="distraction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., social media, notification, colleague"
              className="input w-full"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={closeDistractedPrompt}
            >
              Skip
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Log Distraction
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default DistractionPromptModal;
