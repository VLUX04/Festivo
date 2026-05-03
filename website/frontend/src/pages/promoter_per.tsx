import PageLayout from "../components/pageLayout";
import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import CompleteSetup from "../components/completeSetup";
import { useRegistration } from "../context/RegistrationContext";
import { useNavigate } from "react-router-dom";

const PromoterCustomizationPage: React.FC = () => {
    const { saveRegistration } = useRegistration();

    const { data } = useRegistration();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const response = await fetch("http://localhost:3000/register/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                navigate("/login");
            } else {
                alert(result.message || "Setup failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <PageLayout>
            <CompleteProfile />
            <Preferences
                accountType="Promoter"
                onChange={(profileData) =>
                    saveRegistration({
                        bio: profileData.bio,
                        location: profileData.location,
                    })
                }
            />
            <CompleteSetup onClick={handleSubmit}/>
        </PageLayout>
    );
};

export default PromoterCustomizationPage;
