import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  glass = false,
  animate = false,
  ...props 
}) => {
  return (
    <div 
      className={`
        card ${hover ? 'card-hover' : ''} 
        ${glass ? 'glass' : ''} 
        ${animate ? 'animate-fade-in' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;