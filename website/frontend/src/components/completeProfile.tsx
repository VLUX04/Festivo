import React from 'react';

type CompleteProfileProps = {
  accountType?: string;
};

const CompleteProfile: React.FC<CompleteProfileProps> = ({ accountType }) => (
  <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
    <h1 className='text-5xl font-bold text-[#fff3b0]'>COMPLETE YOUR PROFILE</h1>
    {accountType ? (
      <p className='mt-2 text-[#e09f3e] text-sm uppercase tracking-[0.2em] font-semibold'>{accountType}</p>
    ) : null}
    <p className='text-[#a89060] text-xl mt-3'>Tell us a bit about yourself to personalize your Festivo experience.</p>
  </div>
);

export default CompleteProfile;
