import React from 'react';
import PageLayout from '../components/pageLayout'
import { useNavigate } from 'react-router-dom';
import editIcon from '../icons/edit-profile.png';
import editDarkIcon from '../icons/edit-profile-dark.png';
import { getStoredUser, isAuthenticated } from '../utils/auth';
import { useCommunityState } from '../utils/community.ts';

const ProfilePage: React.FC = () => {

    const navigate = useNavigate();
    const user = React.useMemo(() => getStoredUser(), []);
    const isLoggedIn = isAuthenticated();
    const communityState = useCommunityState();

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
    const displayPreferences = user?.preferences ?? [];
    const attendedEvents = communityState.attendedEvents;
    const publications = communityState.posts.filter((post) => post.isMine);

    return(
        <PageLayout>
            <div className='w-full p-4 space-y-6 flex flex-col items-center mt-6'>
                <div className='w-[82%] bg-[#1a0f10] border-4 border-[#fff3b0] p-8'>
                    <div className='w-full flex flex-row mb-6'>
                        <div className='h-32 w-32 bg-[#3a3122] border-3 border-[#fff3b0] overflow-hidden flex items-center justify-center'>
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt={`${displayName} profile`} className='h-full w-full object-cover' />
                            ) : (
                                <span className='text-[#fff3b0] text-4xl font-bold'>{displayName.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
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
                    <div className='mt-6 flex flex-wrap gap-2'>
                        {displayPreferences.length > 0 ? displayPreferences.map((preference) => (
                            <span key={preference} className='px-3 py-1 border-2 border-[#fff3b0] bg-[#fff3b0] text-[#1a0f10] text-sm'>
                                {preference}
                            </span>
                        )) : (
                            <p className='text-[#a89060] text-lg'>No preferences set yet.</p>
                        )}
                    </div>
                    <section className='mt-10 space-y-10'>
                        <div>
                            <div className='mb-4 flex items-end justify-between gap-4'>
                                <div>
                                    <h2 className='text-3xl font-bold text-[#fff3b0]'>Events attended</h2>
                                    <p className='text-[#a89060]'>Drag sideways to browse your recent activity.</p>
                                </div>
                                <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{attendedEvents.length} items</span>
                            </div>
                            <div className='flex gap-4 overflow-x-auto pb-3'>
                                {attendedEvents.map((event) => (
                                    <article key={event.id} className='min-w-[300px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] overflow-hidden'>
                                        <div className='h-44 overflow-hidden'>
                                            <img src={event.image} alt={event.title} className='h-full w-full object-cover' />
                                        </div>
                                        <div className='space-y-2 p-4'>
                                            <div className='flex items-center justify-between gap-3'>
                                                <h3 className='text-xl font-bold text-[#fff3b0]'>{event.title}</h3>
                                                <span className='border border-[#fff3b0] px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-[#fff3b0]'>{event.status}</span>
                                            </div>
                                            <p className='text-[#a89060]'>{event.location}</p>
                                            <p className='text-[#a89060]'>{event.date}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className='mb-4 flex items-end justify-between gap-4'>
                                <div>
                                    <h2 className='text-3xl font-bold text-[#fff3b0]'>Publications</h2>
                                    <p className='text-[#a89060]'>Recent posts, images, and interactions.</p>
                                </div>
                                <span className='text-sm uppercase tracking-[0.2em] text-[#a89060]'>{publications.length} items</span>
                            </div>
                            <div className='flex gap-4 overflow-x-auto pb-3'>
                                {publications.length > 0 ? publications.map((publication) => (
                                    <article key={publication.id} className='min-w-[280px] flex-shrink-0 border-2 border-[#483d30] bg-[#120707] overflow-hidden'>
                                        <div className='h-44 overflow-hidden'>
                                            <img src={publication.image} alt={publication.caption} className='h-full w-full object-cover' />
                                        </div>
                                        <div className='space-y-2 p-4'>
                                            <h3 className='text-xl font-bold text-[#fff3b0]'>{publication.caption}</h3>
                                            <p className='text-[#a89060]'>{publication.location}</p>
                                            <div className='flex items-center justify-between text-sm text-[#a89060]'>
                                                <span>{publication.likes} likes</span>
                                                <span>{publication.comments.length} comments</span>
                                            </div>
                                        </div>
                                    </article>
                                )) : (
                                    <div className='border-2 border-[#483d30] bg-[#120707] px-4 py-6 text-[#a89060]'>
                                        No publications yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </PageLayout>
    )
};

export default ProfilePage;
