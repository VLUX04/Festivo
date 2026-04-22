import React from 'react';

const title = "COMPLETE YOUR PROFILE";
const subtitle = "Tell us a bit about yourself to personalize your Festivo experience.";

const CompleteProfile: React.FC = () => (
    <div className="w-full text-center py-8 border-b-3 border-[#fff3b0] bg-[#1a0f10]">
        <h1 className="text-4xl font-bold text-[#fff3b0] mb-5">{title}</h1>
        <p className="text-[#a89060] mt-2">{subtitle}</p>
    </div>
);

export default CompleteProfile;
