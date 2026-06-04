import CompleteProfile from "../components/completeProfile";
import Preferences from "../components/preferences";
import CompleteSetup from "../components/completeSetup";
import { useRegistration } from "../context/RegistrationContext";
import { useNavigate } from "react-router-dom";

const PromoterCustomizationPage: React.FC = () => {
    const { saveRegistration } = useRegistration();
    const { data } = useRegistration();
    const navigate = useNavigate();
    const isComplete = data.bio.trim() !== "" && data.location.trim() !== "";

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
        <div className='mx-auto flex w-[82%] flex-col items-center gap-8 py-8'>
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
            <CompleteSetup onClick={handleSubmit} disabled={!isComplete}/>
        </div>
    );
};

export default PromoterCustomizationPage;
