import React from "react";

type CompleteSetupProps = {
    onClick: () => void;
};

const CompleteSetup: React.FC<CompleteSetupProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="w-[50em] h-auto py-5 m-7 mb-[6em] self-center bg-[#fff3b0] text-center flex flex-col items-center shadow-[10px_10px_0_0_#bc821d] hover:shadow-[4px_4px_0_0_#bc821d] transition-shadow duration-300 cursor-pointer">
        <h2 className="text-3xl font-bold text-[#83632c]"> → Complete Setup</h2>
    </button>
);

export default CompleteSetup;
