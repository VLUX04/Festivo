import React from "react";
import PageLayout from "../components/pageLayout";

const AccountCustomizationPage: React.FC = () => {
    return (
        <PageLayout>
            <div className="flex flex-col items-center w-full">
                <h1 className="text-3xl font-bold text-[#fff3b0] text-center mt-8">
                    Choose Your Account Type
                </h1>
                <div className="flex flex-row gap-4 justify-center">
                    <button className="w-[21em] h-auto pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#666348] hover:border-[#fff3b0] transition-colors duration-400 text-center flex flex-col shadow-[15px_15px_0_0_#231c16] cursor-pointer">
                        <h2 className="text-3xl font-bold text-[#fff3b0] mt-2">
                            Event Lover
                        </h2>
                        <p className="text-[#fff3b0] text-left px-6 mt-4 mb-8">
                            Discover and attend cultural events, connect with friends, and share your experiences.
                        </p>
                    </button>
                    <button
                        className="w-[21em] h-auto pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#666348] hover:border-[#fff3b0] transition-colors duration-400 text-center flex flex-col shadow-[15px_15px_0_0_#231c16] cursor-pointer">
                        <h2 className="text-3xl font-bold text-[#fff3b0] mt-2">Artist</h2>
                        <p className="text-[#fff3b0] text-left px-6 mt-4 mb-8">
                            Showcase your art, perform at events, and grow your audience in the cultural community.
                        </p>
                    </button>
                    <button
                        className="w-[21em] h-auto pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#666348] hover:border-[#fff3b0] transition-colors duration-400 text-center flex flex-col shadow-[15px_15px_0_0_#231c16] cursor-pointer">
                        <h2 className="text-3xl font-bold text-[#fff3b0] mt-2">Promoter</h2>
                        <p className="text-[#fff3b0] text-left px-6 mt-4 mb-8">
                            Organize events, find talent, and build unforgettable cultural experiences.
                        </p>
                    </button>
                </div>
            </div>
        </PageLayout>
    );
};

export default AccountCustomizationPage;
