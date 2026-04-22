import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import StyleBadge from "../components/styleBadge";

const ArtistCustomizationPage: React.FC = () => {
    const [, setGenre] = useState<string>("");
    const [, setProfileData] = useState({ bio: "", location: "" });
    return (
        <PageLayout>
                <CompleteProfile
                    title="COMPLETE YOUR PROFILE"
                    subtitle="Tell us a bit about yourself to personalize your Festivo experience."
                />
                <Preferences accountType="Artist" onChange={setProfileData}/>
                <StyleBadge onSelect={setGenre}/>
        </PageLayout>
    );
};

export default ArtistCustomizationPage;
