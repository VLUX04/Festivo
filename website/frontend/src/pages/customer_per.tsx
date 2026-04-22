import React from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import PreferencesBadge from "../components/preferencesBadge";

const CustomerCustomizationPage: React.FC = () => {
    return (
        <PageLayout>
            <CompleteProfile
                title="COMPLETE YOUR PROFILE"
                subtitle="Tell us a bit about yourself to personalize your Festivo experience."
            />
            <Preferences accountType="Event Lover" />
            <PreferencesBadge/>
        </PageLayout>
    );
};

export default CustomerCustomizationPage;
