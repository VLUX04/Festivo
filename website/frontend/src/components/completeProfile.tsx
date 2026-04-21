import React from 'react';

type CompleteProfileProps = {
  title: string;
  subtitle: string;
};

const CompleteProfile: React.FC<CompleteProfileProps> = ({ title, subtitle }) => (
  <div className="w-full text-center py-8 border-b-3 border-[#fff3b0] bg-[#1a0f10]">
    <h1 className="text-4xl font-bold text-[#fff3b0] mb-5">{title}</h1>
    <p className="text-[#a89060] mt-2">{subtitle}</p>
  </div>
);

export default CompleteProfile;
