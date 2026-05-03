import React from 'react';
import PageLayout from '../components/pageLayout'
import { useNavigate } from 'react-router-dom';
import editIcon from '../icons/edit-profile.png';
import editDarkIcon from '../icons/edit-profile-dark.png';
import { getStoredUser, isAuthenticated } from '../utils/auth';

const ProfilePage: React.FC = () => {

    const navigate = useNavigate();
    const user = React.useMemo(() => getStoredUser(), []);
    const isLoggedIn = isAuthenticated();

    React.useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    if (!isLoggedIn) {
        return null;
    }

    const displayName = user?.name || user?.username || 'Festivo User';
    const displayRole = user?.role 
        ? (user.role == 'customer' 
            ? 'Event Lover' 
            : user.role.charAt(0).toUpperCase() + user.role.slice(1)) 
        : 'Event Lover';
    const displayEmail = user?.email || 'Email not set';

    return(
        <PageLayout>
            <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
                <div className='w-[82%] bg-[#1a0f10] border-4 border-[#fff3b0] p-8'>
                    <div className='w-full flex flex-row mb-6'>
                        <div className='h-32 w-32 bg-[#e09f3e]'></div>
                        <div className='flex flex-col ml-10'>
                            <div className='flex flex-row'>
                                <h1 className='text-[#fff3b0] text-5xl font-bold mb-2'>{displayName}</h1>
                                <p className='text-[#540b0e] px-3 py-1 bg-[#e09f3e] ml-3 self-center'>{displayRole}</p>
                            </div>
                            <p className='text-[#a89060] text-xl'>@{user?.username || 'user'}</p>
                            <p className='text-[#a89060] text-xl'>{displayEmail}</p>
                        </div>
                        <div className='ml-auto'>
                            <button onClick={() => navigate('/edit-profile')} className='group flex flex-row items-center border-2 border-[#fff3b0] text-[#fff3b0] px-4 py-2 hover:bg-[#fff3b0] hover:text-[#1a0f10] transition duration-333 ease-in-out hover:cursor-pointer'>
                                <img src={editIcon} alt="Edit" className='h-5 w-5 object-contain mr-3 block group-hover:hidden'/>
                                <img src={editDarkIcon} alt="Edit" className='h-5 w-5 object-contain mr-3 hidden group-hover:block'/>
                                Edit Profile
                            </button>
                        </div>
                    </div>
                    <p className='text-[#a89060] text-xl'>Find cultural experiences, concerts, exhibitions, and gatherings happening around you.</p>
                    <section className='grid grid-cols-4'>

                    </section>
                </div>
            </div>
        </PageLayout>
    )
};

export default ProfilePage;
