import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import profile_icon from "../icons/profile.png";
import location_icon from "../icons/map.png";

type AccountTypeBadgeProps = {
    accountType: string;
    onChange: (data: { bio: string, location: string }) => void;
};

const Preferences: React.FC<AccountTypeBadgeProps> = ({ accountType, onChange }) => {
    const navigate = useNavigate();
    const [bio, setBio] = useState("");
    const [location, setLocation] = useState("");

    return (
       <div className="flex flex-col items-center w-full">
            <div className="w-[50em] h-auto px-6 py-4 m-7 mb-3 bg-[#1a0f10] border-3 border-[#fff3b0] flex flex-row items-center justify-between">
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

            <div className="w-[50em] h-auto px-6 py-4 m-7 mb-3 bg-[#1a0f10] border-3 border-[#483d30] flex flex-col">
                <div className="text-left">
                    <h2 className="text-[#fff3b0] text-3xl font-bold mb-3">About you</h2>
                    <p className="text-[#fff3b0]">Tell us about yourself</p>
                </div>
                <textarea
                    value={bio}
                    onChange={(e) => { setBio(e.target.value); onChange({ bio: e.target.value, location}); }}
                    placeholder="Your story, interests, or what you do..."
                    className="w-full mt-4 mb-2 p-3 bg-[#0a0505] border-3 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] transition-colors duration-300 resize-none h-30 focus:outline-none focus:border-[#a89a60]"/>
            </div>

            <div className="w-[50em] h-auto px-6 py-4 m-7 mb-3 bg-[#1a0f10] border-3 border-[#483d30] flex flex-col">
                <div className="flex flex-row items-center gap-2 mb-3">
                    <img src={location_icon} alt="Location" className="w-8 h-8 object-contain"/>
                    <h2 className="text-[#fff3b0] text-3xl font-bold">Location</h2>
                </div>
                <p className="text-[#fff3b0]">Where you are based</p>
                <input
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); onChange({ bio, location: e.target.value }); }}
                    type="text"
                    placeholder="e.g., Lisboa, Porto, Coimbra, ..."
                    className="w-full mt-4 mb-2 px-3 py-2 bg-[#0a0505] border-3 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] transition-colors duration-300 focus:outline-none focus:border-[#a89a60]"/>
            </div>
        </div> 
    );
};

export default Preferences;
