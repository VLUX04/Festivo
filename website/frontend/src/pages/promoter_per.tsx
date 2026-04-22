import React from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";

const PromoterCustomizationPage: React.FC = () => {
    return (
        <PageLayout>
                <CompleteProfile
                    title="COMPLETE YOUR PROFILE"
                    subtitle="Tell us a bit about yourself to personalize your Festivo experience."
                />
                <Preferences accountType="Promoter"/>
        </PageLayout>
    );
};

export default PromoterCustomizationPage;
