import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import PreferencesBadge from "../components/preferencesBadge";

const CustomerCustomizationPage: React.FC = () => {
    const [, setPreferences] = useState<string[]>([]);
    const [, setProfileData] = useState({ bio: "", location: "" });
    return (
        <PageLayout>
            <CompleteProfile
                title="COMPLETE YOUR PROFILE"
                subtitle="Tell us a bit about yourself to personalize your Festivo experience."
            />
            <Preferences accountType="Event Lover" onChange={setProfileData}/>
            <PreferencesBadge onChange={setPreferences}/>
        </PageLayout>
    );
};

export default CustomerCustomizationPage;
