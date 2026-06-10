import React from 'react';
import PageLayout from '../components/pageLayout';
import { useNavigate } from 'react-router-dom';
import customer_icon from '../icons/profile.png';
import { useRegistration } from '../context/RegistrationContext';

const ACCOUNT_TYPES = [
  {
    key: 'customer',
    label: 'Event Lover',
    description: 'Discover and attend cultural events, connect with friends, and share your experiences.',
  },
  {
    key: 'artist',
    label: 'Artist',
    description: 'Showcase your art, perform at events, and grow your audience in the cultural community.',
  },
  {
    key: 'promoter',
    label: 'Promoter',
    description: 'Organize events, find talent, and build unforgettable cultural experiences.',
  },
] as const;

const AccountCustomizationPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveRegistration } = useRegistration();

  const handleSelect = (type: string) => {
    saveRegistration({ accountType: type });
    navigate(`/${type}_per`);
  };

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6 pb-12'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8'>
          <h1 className='text-5xl font-bold text-[#fff3b0]'>CHOOSE YOUR ROLE</h1>
          <p className='text-[#a89060] text-xl mt-3'>Select the account type that best describes you.</p>
        </div>

        <div className='w-[82%] grid gap-6 md:grid-cols-3'>
          {ACCOUNT_TYPES.map(({ key, label, description }) => (
            <button
              key={key}
              type='button'
              onClick={() => handleSelect(key)}
              className='card-button text-left border-2 border-[#483d30] bg-[#1a0f10] p-8 flex flex-col gap-4 hover:border-[#fff3b0] transition cursor-pointer'
            >
              <div className='card-icon w-14 h-14 border-2 border-[#fff3b0] bg-[#3a3122] flex items-center justify-center shrink-0'>
                <img src={customer_icon} alt={label} className='w-8 h-8 object-contain' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-[#fff3b0]'>{label}</h2>
                <p className='text-[#a89060] mt-2 leading-7'>{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default AccountCustomizationPage;
