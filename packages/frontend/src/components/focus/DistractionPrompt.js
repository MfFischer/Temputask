// packages/frontend/src/components/focus/DistractionPrompt.js
import React, { useState } from 'react';
import { useFocusContext } from '../../contexts/FocusContext';
import Button from '../common/Button';

export default function DistractionPrompt({ onResume }) {
  const { recordDistraction, resumeFocus } = useFocusContext();
  const [wasDistracted, setWasDistracted] = useState(null);
  const [description, setDescription] = useState('');

  // Common distraction categories
  const distractionTypes = [
    'Social Media',
    'Email',
    'Messages',
    'Browsing',
    'Colleague',
    'Phone',
    'Other'
  ];

  const handleResponse = (distracted) => {
    setWasDistracted(distracted);
    
    if (!distracted) {
      // If not distracted, immediately resume
      resumeFocus();
      if (onResume) onResume();
    }
  };

  const handleSubmit = async () => {
    // Log the distraction
    await recordDistraction(description || 'Unspecified distraction');
    
    // Resume focus session
    if (onResume) onResume();
  };

  return (
    <div className="space-y-4">
      {wasDistracted === null ? (
        <>
          <h3 className="text-lg font-medium text-center">Were you distracted?</h3>
          <div className="flex gap-3">
            <Button
              onClick={() => handleResponse(true)}
              variant="danger"
              className="flex-1"
            >
              Yes, I was distracted
            </Button>
            <Button
              onClick={() => handleResponse(false)}
              variant="success"
              className="flex-1"
            >
              No, just a quick break
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-center">What distracted you?</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {distractionTypes.map((item) => (
              <button
                key={item}
                onClick={() => setDescription(item)}
                className={`px-3 py-1 rounded-md ${
                  description === item
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what distracted you..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          
          <Button onClick={handleSubmit} fullWidth>
            Log Distraction & Continue
          </Button>
        </>
      )}
    </div>
  );
}