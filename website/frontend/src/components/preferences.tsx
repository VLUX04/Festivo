import React from "react";
import { useNavigate } from "react-router-dom";
import profile_icon from "../icons/profile.png";

type AccountTypeBadgeProps = {
    accountType: string;
};

const Preferences: React.FC<AccountTypeBadgeProps> = ({ accountType }) => {
    const navigate = useNavigate();

    return (
        <div className="self-center w-[45em] h-auto px-6 py-5 m-7 bg-[#1a0f10] border-3 border-[#a89a60] flex flex-row items-center justify-between shadow-[15px_15px_0_0_#231c16]">
            <div className="flex flex-row items-center gap-4">
                <div className="w-14 h-14 border-3 border-[#a89a60] flex items-center justify-center">
                    <img src={profile_icon} alt="Profile" className="w-8 h-8 object-contain"/>
                </div>
                <div className="text-left">
                    <p className="text-[#a89a60] text-sm">Account Type</p>
                    <h2 className="text-[#fff3b0] text-xl font-bold">{accountType}</h2>
                </div>
            </div>
            <button
                onClick={() => navigate("/account")}
                className="group transition duration-250 ease-in-out px-6 py-2 bg-[#1a0f10] hover:bg-[#fff3b0] border-3 border-[#483d30] hover:border-[#fff3b0] flex items-center justify-center cursor-pointer"
            >
                <span className="text-[#fff3b0] group-hover:text-[#540b0e]">
                    Change
                </span>
            </button>
        </div>
    );
};

export default Preferences;
