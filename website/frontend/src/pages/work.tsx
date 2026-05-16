import React from 'react';
import PageLayout from '../components/pageLayout'
import { useNavigate } from 'react-router-dom';
import { getStoredUser, isProfessionalRole } from '../utils/auth.ts';

const WorkPage: React.FC = () => {
  const navigate = useNavigate();
  const user = React.useMemo(() => getStoredUser(), []);
  const canAccessWork = isProfessionalRole(user?.role);

  React.useEffect(() => {
    if (!canAccessWork) {
      navigate('/events', { replace: true });
    }
  }, [canAccessWork, navigate]);

  if (!canAccessWork) {
    return null;
  }

  return (
    <PageLayout>
      <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
        <div className='w-[82%] border-4 border-[#fff3b0] bg-[#1a0f10] p-8 flex flex-col gap-6'>
          <div>
            <h1 className='text-[#fff3b0] text-5xl font-bold mb-4'>WORKSPACE</h1>
            <p className='text-[#a89060] text-xl'>Create and manage events for cultural professionals.</p>
          </div>
          <button
            type='button'
            onClick={() => navigate('/work/create')}
            className='w-fit border-3 border-[#fff3b0] bg-[#fff3b0] px-6 py-3 text-[#540b0e] transition duration-300 ease-in-out hover:bg-[#1a0f10] hover:text-[#fff3b0]'
          >
            Create Event
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default WorkPage;
