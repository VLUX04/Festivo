import React, { useState } from "react";
import preferences_icon from "../icons/price.png"

const StyleBadge: React.FC = () => {
    const [selected, setSelected] = useState<string>("");
    const genres = ["Techno", "House", "Jazz", "Rock", "Hip Hop", "Eletronic", "Theatre", "Art", "Cinema", "Dance", "Comedy", "Classical"];

    return (
        <div className="self-center w-[50em] h-auto px-6 py-4 m-7 mb-3 bg-[#1a0f10] border-3 border-[#483d30] flex flex-col shadow-[15px_15px_0_0_#231c16]">
            <div className="flex flex-row items-center gap-2 mb-3">
                <img src={preferences_icon} alt="Preferences" className="w-8 h-8 object-contain"/>
                <h2 className="text-[#fff3b0] text-3xl font-bold ml-1">Your Style</h2>
            </div>
            <p className="text-[#fff3b0]">Your primary artistic style or genre.</p>

            <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full mt-4 mb-2 px-3 py-2 bg-[#0a0505] border-3 border-[#483d30] text-[#fff3b0] transition-colors duration-300 focus:outline-none focus:border-[#a89a60] cursor-pointer">
                <option value="" disabled>Select a genre...</option>
                {genres.map((genre) => (
                    <option key={genre} value={genre}>{genre}</option>
                ))}
            </select>
        </div>
    );
};

export default StyleBadge;
