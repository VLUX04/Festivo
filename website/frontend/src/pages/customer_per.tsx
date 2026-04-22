import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import PreferencesBadge from "../components/preferencesBadge";
import CompleteSetup from "../components/completeSetup";

const CustomerCustomizationPage: React.FC = () => {
    const [, setPreferences] = useState<string[]>([]);
    const [, setProfileData] = useState({ bio: "", location: "" });
    return (
        <PageLayout>
            <CompleteProfile/>
            <Preferences accountType="Event Lover" onChange={setProfileData}/>
            <PreferencesBadge onChange={setPreferences}/>
            <CompleteSetup/>
        </PageLayout>
    );
};

export default CustomerCustomizationPage;
