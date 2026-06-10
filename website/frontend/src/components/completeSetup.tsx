import React from 'react';

type CompleteSetupProps = {
  onClick: () => void;
  disabled?: boolean;
};

const CompleteSetup: React.FC<CompleteSetupProps> = ({ onClick, disabled }) => (
  <div className='w-[82%] flex justify-end pb-4'>
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      className='border-2 border-[#fff3b0] bg-[#fff3b0] px-8 py-4 text-xl font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:cursor-not-allowed disabled:opacity-40 disabled:border-[#483d30] disabled:bg-transparent disabled:text-[#483d30]'
    >
      Complete Setup →
    </button>
  </div>
);

export default CompleteSetup;
