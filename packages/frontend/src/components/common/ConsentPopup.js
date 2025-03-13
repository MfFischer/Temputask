import React, { useState, useEffect } from 'react';
import Button from './Button';

const ConsentPopup = ({ onClose }) => {
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    // Only show the popup if consent hasn't been given before
    const hasConsented = localStorage.getItem('user_consent');
    if (!hasConsented) {
      setShowPopup(true);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('user_consent', 'true');
    setShowPopup(false);
    if (onClose) onClose(true);
  };
  
  const handleDecline = () => {
    setShowPopup(false);
    if (onClose) onClose(false);
  };
  
  if (!showPopup) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 mx-4 bg-white rounded-lg shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Privacy and Data Collection</h3>
        
        <div className="mt-4 text-sm text-gray-700">
          <p className="mb-3">
            Tempu Task collects your time tracking data to provide you with insights about your productivity.
            We value your privacy and ensure your data is securely stored and never shared with third parties.
          </p>
          
          <p className="mb-3">
            By using Tempu Task, you agree to our data collection practices as outlined in our 
            <a href="/privacy" className="text-primary-600 hover:text-primary-700 mx-1">
              Privacy Policy
            </a>
            and
            <a href="/terms" className="text-primary-600 hover:text-primary-700 mx-1">
              Terms of Service
            </a>.
          </p>
          
          <p>
            You can export or delete your data at any time from your account settings.
          </p>
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button 
            variant="primary" 
            onClick={handleAccept}
            className="flex-1"
          >
            I Accept
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDecline}
            className="flex-1"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;