// packages/frontend/src/contexts/FocusContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useFocus } from '../hooks/useFocus';

// Create context
export const FocusContext = createContext();

// Provider component
export const FocusProvider = ({ children }) => {
  const focusHook = useFocus();
  const [showDistractedPrompt, setShowDistractedPrompt] = useState(false);
  
  // When focus is paused, show the distraction prompt
  useEffect(() => {
    if (focusHook.isPaused) {
      setShowDistractedPrompt(true);
    }
  }, [focusHook.isPaused]);
  
  // Handle when distraction is logged
  const handleDistractionLogged = (description) => {
    focusHook.recordDistraction(description);
    setShowDistractedPrompt(false);
    focusHook.resumeFocus();
  };
  
  // Handle closing the prompt without logging
  const closeDistractedPrompt = () => {
    setShowDistractedPrompt(false);
    // Keep focus paused or resume based on user intention
  };
  
  // The value provided to consuming components
  const providerValue = {
    ...focusHook,
    showDistractedPrompt,
    setShowDistractedPrompt,
    handleDistractionLogged,
    closeDistractedPrompt
  };
  
  return (
    <FocusContext.Provider value={providerValue}>
      {children}
    </FocusContext.Provider>
  );
};

// Custom hook for using the focus context
export const useFocusContext = () => useContext(FocusContext);