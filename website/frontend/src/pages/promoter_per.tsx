import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import CompleteSetup from "../components/completeSetup";

const PromoterCustomizationPage: React.FC = () => {
    const [, setProfileData] = useState({ bio: "", location: "" });
    return (
        <PageLayout>
                <CompleteProfile/>
                <Preferences accountType="Promoter" onChange={setProfileData}/>
                <CompleteSetup/>
        </PageLayout>
    );
};

export default PromoterCustomizationPage;
