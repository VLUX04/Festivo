import React from 'react';
import PageLayout from '../components/pageLayout';
import CompleteProfile from '../components/completeProfile';
import Preferences from '../components/preferences';
import StyleBadge from '../components/styleBadge';
import CompleteSetup from '../components/completeSetup';
import { useRegistration } from '../context/RegistrationContext';
import { useNavigate } from 'react-router-dom';

const ArtistCustomizationPage: React.FC = () => {
  const { saveRegistration, data } = useRegistration();
  const navigate = useNavigate();
  const isComplete = data.bio.trim() !== '' && data.location.trim() !== '' && data.preferences.length > 0;

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3000/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        navigate('/login');
      } else {
        alert(result.message || 'Setup failed.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6 pb-12'>
        <CompleteProfile accountType='Artist' />
        <Preferences
          accountType='Artist'
          onChange={(profileData) => saveRegistration({ bio: profileData.bio, location: profileData.location })}
        />
        <StyleBadge onSelect={(genre) => saveRegistration({ preferences: [genre] })} />
        <CompleteSetup onClick={handleSubmit} disabled={!isComplete} />
      </div>
    </PageLayout>
  );
};

export default ArtistCustomizationPage;
