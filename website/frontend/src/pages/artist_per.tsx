import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import StyleBadge from "../components/styleBadge";
import CompleteSetup from "../components/completeSetup";
import { useRegistration } from "../context/RegistrationContext";

const ArtistCustomizationPage: React.FC = () => {
    const { saveRegistration } = useRegistration();
    return (
        <PageLayout>
            <CompleteProfile />
            <Preferences
                accountType="Artist"
                onChange={(profileData) =>
                    saveRegistration({
                        bio: profileData.bio,
                        location: profileData.location,
                    })
                }
            />
            <StyleBadge
                onSelect={(genre) => saveRegistration({ preferences: [genre] })}
            />
            <CompleteSetup />
        </PageLayout>
    );
};

export default ArtistCustomizationPage;
