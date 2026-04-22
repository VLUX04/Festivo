import React, { useState } from "react";
import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import StyleBadge from "../components/styleBadge";
import CompleteSetup from "../components/completeSetup";

const ArtistCustomizationPage: React.FC = () => {
    const [, setGenre] = useState<string>("");
    const [, setProfileData] = useState({ bio: "", location: "" });
    return (
        <PageLayout>
                <CompleteProfile/>
                <Preferences accountType="Artist" onChange={setProfileData}/>
                <StyleBadge onSelect={setGenre}/>
                <CompleteSetup/>
        </PageLayout>
    );
};

export default ArtistCustomizationPage;
