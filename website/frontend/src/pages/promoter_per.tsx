import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";

const PromoterCustomizationPage: React.FC = () => {
    const [, setProfileData] = useState({ bio: "", location: "" });
    return (
        <PageLayout>
                <CompleteProfile
                    title="COMPLETE YOUR PROFILE"
                    subtitle="Tell us a bit about yourself to personalize your Festivo experience."
                />
                <Preferences accountType="Promoter" onChange={setProfileData}/>
        </PageLayout>
    );
};

export default PromoterCustomizationPage;
