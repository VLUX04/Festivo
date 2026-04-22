import React from 'react';
import PageLayout from '../components/pageLayout'
import { Link, useNavigate} from 'react-router-dom';
import editIcon from '../icons/edit-profile.png';
import editDarkIcon from '../icons/edit-profile-dark.png';

const ProfilePage: React.FC = () => {

    const navigate = useNavigate();

    return(
        <PageLayout>
            <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
                <div className='w-[82%] bg-[#1a0f10] border-4 border-[#fff3b0] p-8'>
                    <div className='w-full flex flex-row mb-6'>
                        <div className='h-32 w-32 bg-[#e09f3e]'></div>
                        <div className='flex flex-col ml-10'>
                            <div className='flex flex-row'>
                                <h1 className='text-[#fff3b0] text-5xl font-bold mb-2'>John Doe</h1>
                                <p className='text-[#540b0e] px-3 py-1 bg-[#e09f3e] ml-3 self-center'>Event Lover</p>
                            </div>
                            <p className='text-[#a89060] text-xl'>San Francisco, CA</p>
                            <p className='text-[#a89060] text-xl'>john.doe@example.com</p>
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