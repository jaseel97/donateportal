import React from 'react';

const ProgressBar = ({ currentStep }) => {
  const steps = ['Donation Offered', 'Reserved', 'Picked Up'];
  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <span className="text-xs mt-1 text-gray-600">{step}</span>
          </div>
        ))}
      </div>
      <div className="h-1 w-full bg-gray-200 rounded">
        <div 
          className="h-1 bg-blue-600 rounded transition-all duration-500"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;