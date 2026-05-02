import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import PreferencesBadge from "../components/preferencesBadge";
import CompleteSetup from "../components/completeSetup";
import { useRegistration } from "../context/RegistrationContext";

const CustomerCustomizationPage: React.FC = () => {
    const { saveRegistration } = useRegistration();
    return (
        <PageLayout>
            <CompleteProfile/>
            <Preferences 
                accountType="Event Lover" 
                onChange={(profileData) => saveRegistration({
                    bio: profileData.bio,
                    location: profileData.location
                })}
            />
            <PreferencesBadge 
                onChange={(prefs) => saveRegistration({ preferences: prefs })}
            />
            <CompleteSetup/>
        </PageLayout>
    );
};

export default CustomerCustomizationPage;
