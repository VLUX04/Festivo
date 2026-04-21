import React from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import AccountTypeBadge from "../components/accountType";

const ArtistCustomizationPage: React.FC = () => {
    return (
        <PageLayout>
                <CompleteProfile
                    title="COMPLETE YOUR PROFILE"
                    subtitle="Tell us a bit about yourself to personalize your Festivo experience."
                />
                <AccountTypeBadge accountType="Artist"/>
        </PageLayout>
    );
};

export default ArtistCustomizationPage;
