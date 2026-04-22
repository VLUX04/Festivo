import React from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import { useNavigate } from "react-router-dom";
import customer_icon from "../icons/profile.png";

const AccountCustomizationPage: React.FC = () => {
    const navigate = useNavigate();
    const handleSelect = (type: string) => {
        // save the account later
        navigate("/" + type + "_per");
    };

    return (
        <PageLayout>
            <CompleteProfile/>
            <h1 className="text-3xl font-bold text-[#fff3b0] text-center mt-8">
                Choose Your Account Type
            </h1>
            <div className="flex flex-row gap-4 justify-center">
                <button
                    onClick={() => handleSelect("customer")}
                    className="card-button w-[21em] h-[15em] pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#483d30] hover:border-[#fff3b0] transition-colors duration-400 text-left flex flex-col cursor-pointer">
                    <div className="card-icon ml-6 w-14 h-14 bg-[#3a3122] border-3 border-[#fff3b0] flex items-center justify-center">
                        <img src={customer_icon} alt="Customer" className="w-8 h-8 object-contain"/>
                    </div>
                    <h2 className="text-3xl font-bold text-[#fff3b0] mt-2 px-6">
                        Event Lover
                    </h2>
                    <p className="text-[#a89060] px-6 mt-4 mb-8">
                        Discover and attend cultural events, connect with friends, and share
                        your experiences.
                    </p>
                </button>

                <button
                    onClick={() => handleSelect("artist")}
                    className="card-button w-[21em] h-[15em] pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#483d30] hover:border-[#fff3b0] transition-colors duration-400 text-left flex flex-col cursor-pointer">
                    <div className="card-icon ml-6 w-14 h-14 bg-[#3a3122] border-3 border-[#fff3b0] flex items-center justify-center">
                        <img src={customer_icon} alt="Customer" className="w-8 h-8 object-contain"/>
                    </div>                    
                    <h2 className="text-3xl font-bold text-[#fff3b0] mt-2 px-6">Artist</h2>
                    <p className="text-[#a89060] px-6 mt-4 mb-8">
                        Showcase your art, perform at events, and grow your audience in the
                        cultural community.
                    </p>
                </button>

                <button
                    onClick={() => handleSelect("promoter")}
                    className="card-button w-[21em] h-[15em] pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#483d30] hover:border-[#fff3b0] transition-colors duration-400 text-left flex flex-col cursor-pointer">
                    <div className="card-icon ml-6 w-14 h-14 bg-[#3a3122] border-3 border-[#fff3b0] flex items-center justify-center">
                        <img src={customer_icon} alt="Customer" className="w-8 h-8 object-contain"/>
                    </div>
                    <h2 className="text-3xl font-bold text-[#fff3b0] mt-2 px-6">Promoter</h2>
                    <p className="text-[#a89060] text-left px-6 mt-4 mb-8">
                        Organize events, find talent, and build unforgettable cultural
                        experiences.
                    </p>
                </button>
            </div>
        </PageLayout>
    );
};

export default AccountCustomizationPage;
