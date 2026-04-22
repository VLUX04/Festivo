import React, { useState } from "react";
import preferences_icon from "../icons/price.png"

const PreferencesBadge: React.FC = () => {
    const [input, setInput] = useState("");
    const [preferences, setPreferences] = useState<string[]>([]);

    const handleAdd = () => {
        if (input.trim() === "" || preferences.length >= 10) return;
        setPreferences([...preferences, input.trim()]);
        setInput("");
    };

    const genres = ["Techno", "House", "Jazz", "Rock", "Hip Hop", "Eletronic", "Theatre", "Art", "Cinema", "Dance", "Comedy", "Classical"];

    return (
        <div className="self-center w-[50em] h-auto px-6 py-4 m-7 mb-3 bg-[#1a0f10] border-3 border-[#483d30] flex flex-col shadow-[15px_15px_0_0_#231c16]">
            <div className="flex flex-row items-center gap-2 mb-3">
                <img src={preferences_icon} alt="Preferences" className="w-8 h-8 object-contain"/>
                <h2 className="text-[#fff3b0] text-3xl font-bold ml-1">Your Preferences</h2>
            </div>
            <p className="text-[#fff3b0]">Select your favorite cultural genres and interests (up to 10).</p>

            <div className="flex flex-row flex-wrap gap-2 mt-4">
                {preferences.map((pref, index) => (
                    <div key={index} className="flex flex-row items-center px-3 py-0 border-3 border-[#fff3b0] text-[#483d30] bg-[#fff3b0]">
                        <span className="text-[#1a0f10]">{pref}</span>
                        <button
                            onClick={() => setPreferences(preferences.filter((_, i) => i !== index))}
                            className="text-[#1a0f10] hover:text-[#540b0e] ml-2 transition-colors duration-300 cursor-pointer font-bold">
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex flex-row gap-2 mt-4 mb-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="Other preferences..."
                    className="flex-1 px-3 py-2 bg-[#0a0505] border-3 border-[#483d30] text-[#fff3b0] placeholder-[#91805D] transition-colors duration-300 focus:outline-none focus:border-[#a89a60]"/>
                <button
                    onClick={handleAdd}
                    disabled={input.trim() === "" || preferences.length >= 10}
                    className="w-10 h-10 self-center border-3 border-[#483d30] text-[#fff3b0] flex items-center justify-center transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#a89a60] hover:text-[#a89a60] cursor-pointer">
                    +
                </button>
            </div>

            <div className="flex flex-row flex-wrap gap-2 mt-3">
                {genres.map((genre) => (
                    <button
                        key={genre}
                        onClick={() => {
                            if (preferences.includes(genre) || preferences.length >= 10) return;
                            setPreferences([...preferences, genre]);
                        }}
                        disabled={preferences.includes(genre) || preferences.length >= 10}
                        className="px-3 py-1 border-3 border-[#483d30] text-[#91805D] bg-[#0a0505] hover:border-[#a89a60] hover:text-[#fff3b0] transition-colors duration-300 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
                        {genre}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PreferencesBadge;
