import '../style.css'
import React from 'react';
import { Link } from 'react-router-dom';
import eventsIcon from '../icons/events.png';
import friendsIcon from '../icons/friends.png';
import socialIcon from '../icons/social.png';
import workIcon from '../icons/work.png';
import mapIcon from '../icons/map.png';
import profileIcon from '../icons/profile.png';
import loginIcon from '../icons/login.png';
import {
    AUTH_CHANGED_EVENT,
    clearAuthSession,
    getStoredUser,
    isAuthenticated,
    isProfessionalRole,
} from '../utils/auth';
import {
    clearNotifications,
    getNotificationCount,
    getNotificationPreview,
    markAllNotificationsRead,
    useCommunityState,
} from '../utils/community.ts';
import { useNavigate } from 'react-router-dom';

const navItems = [
    { label: 'Events', icon: eventsIcon },
    { label: 'Friends', icon: friendsIcon },
    { label: 'Social', icon: socialIcon },
    { label: 'Work', icon: workIcon },
    { label: 'Map', icon: mapIcon },
];

const navButtonClass = 'group transition duration-333 ease-in-out border-2 border-[#483d30] h-1/2 px-5 text-[#fff3b0] hover:bg-[#553a1e] hover:border-[#fff3b0] hover:cursor-pointer active:bg-[#fff3b0] active:text-[#540b0e] flex items-center justify-center gap-1';

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const [isLogged, setIsLogged] = React.useState<boolean>(isAuthenticated());
    const [isProfessional, setIsProfessional] = React.useState<boolean>(isProfessionalRole(getStoredUser()?.role));
    const navigate = useNavigate();
    const communityState = useCommunityState();
    const unreadNotifications = getNotificationCount(communityState);
    const previewNotifications = getNotificationPreview(communityState);

    React.useEffect(() => {
        const updateAuth = () => {
            setIsLogged(isAuthenticated());
            setIsProfessional(isProfessionalRole(getStoredUser()?.role));
        };

        window.addEventListener(AUTH_CHANGED_EVENT, updateAuth);
        window.addEventListener('storage', updateAuth);

        return () => {
            window.removeEventListener(AUTH_CHANGED_EVENT, updateAuth);
            window.removeEventListener('storage', updateAuth);
        };
    }, []);

    return (
    <header className='bg-[#1a0f10] flex h-22 border-b-3 border-[#fff3b0] justify-center'>
        <div className='relative flex w-[80%] justify-self-center'>
            <div className='flex-1 flex items-center'>
                <div className="group relative h-[70%] w-[70%]">
                    <p className="absolute inset-0 flex items-center justify-center text-5xl text-[#fff3b0] font-bold group-hover:hidden">FESTIVO</p>
                    <div className="absolute inset-0 hidden group-hover:flex items-center justify-center">
                        {Array.from({ length: 15 }, (_, i) => (
                            <div key={i} className="w-[10%] h-[10%] bg-[#fff3b0] mx-[2.5px] opacity-0"
                                style={{
                                    animation: "fadeIn 0.15s ease forwards, wave 0.9s ease-in-out infinite",
                                    animationDelay: `${i * 0.1}s`,
                                    transformOrigin: "center"
                                }}>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className='flex-3 flex'>
                {navItems.filter(({ label }) => label !== 'Work' || isProfessional).map(({ label, icon }) => (
                    <div key={label} className='flex-1 flex justify-center place-items-center'>
                        <Link to={`/${label.toLowerCase()}`} className={navButtonClass}>
                            <img src={icon} alt="" className='h-5 w-5 object-contain group-active:mix-blend-color' aria-hidden='true' />
                            <span>{label}</span>
                        </Link>
                    </div>
                ))}
            </div>
            <div className='flex-1 flex justify-center place-items-center'>
                <div className='flex-4 place-items-end'>
                    {isLogged ? 
                        <Link to="/profile" className='transition duration-333 ease-in-out text-xl text-[#fff3b0] hover:cursor-pointer hover:scale-110 flex items-center gap-1 group'>
                            <div className="relative h-7 w-7">
                                <img src={profileIcon} alt="" className="h-7 w-7 object-contain rounded-full" aria-hidden="true"/>
                                <svg className="absolute inset-0 w-full h-full -rotate-90"viewBox="0 0 40 40">
                                    <circle cx="20" cy="20" r="19" fill="none" stroke="#fff3b0" strokeWidth="3" strokeDasharray="120" strokeDashoffset="120"  className="transition-all duration-700 ease-in-out group-hover:[stroke-dashoffset:0]"/>
                                </svg>
                            </div>
                            <span className='mb-[4px]'>Profile</span>
                        </Link>
                    :
                        <Link to="/login" className='transition duration-333 ease-in-out text-xl text-[#fff3b0] hover:cursor-pointer hover:scale-110 flex items-center gap-1 group'>
                            <div className="relative h-5 w-5">
                                <img src={loginIcon} alt="" className="object-contain" aria-hidden="true"/>
                            </div>
                            <span className='mb-[4px]'>Login</span>
                        </Link>
                    }
                    
                </div>
                <div className='relative flex-1 place-items-end'>
                    <button
                        type='button'
                        aria-label='Toggle menu'
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className='flex flex-col h-5 w-7 gap-1 group cursor-pointer'>
                        <div className={`transition duration-500 ease-in-out bg-[#fff3b0] w-[90%] h-2 ${menuOpen ? 'rotate-45 translate-y-[200%]' : 'group-hover'} group-hover:scale-110`}></div>
                        <div className={`transition duration-500 ease-in-out bg-[#fff3b0] w-[90%] h-2 origin-center ${menuOpen ? 'scale-x-0 opacity-0' : 'group-hover'} group-hover:scale-110`}></div>
                        <div className={`transition duration-500 ease-in-out bg-[#fff3b0] w-[90%] h-2 ${menuOpen ? '-rotate-45 -translate-y-[200%]' : 'group-hover'} group-hover:scale-110`}></div>
                    </button>

                    {menuOpen ? (
                        <div className='absolute right-0 top-[calc(100%+0.75rem)] z-50 w-64 border-2 border-[#fff3b0] bg-[#120707] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)]'>
                            <button
                                type='button'
                                onClick={() => {
                                    setNotificationsOpen((prev) => !prev);
                                    setMenuOpen(false);
                                }}
                                className='mb-2 w-full border border-[#483d30] px-4 py-3 text-left text-[#fff3b0] transition hover:border-[#fff3b0] hover:bg-[#1a0f10]'
                            >
                                Notifications {unreadNotifications > 0 ? `(${unreadNotifications})` : ''}
                            </button>
                            <button
                                type='button'
                                onClick={() => {
                                    clearAuthSession();
                                    setMenuOpen(false);
                                    setNotificationsOpen(false);
                                    navigate('/login');
                                }}
                                className='w-full border border-[#483d30] px-4 py-3 text-left text-[#fff3b0] transition hover:border-[#fff3b0] hover:bg-[#1a0f10]'
                            >
                                Logout
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            {notificationsOpen ? (
                <div className='absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[22rem] border-2 border-[#fff3b0] bg-[#120707] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)]'>
                    <div className='flex items-center justify-between gap-3'>
                        <h3 className='text-lg font-bold text-[#fff3b0]'>Notifications</h3>
                        <button
                            type='button'
                            onClick={() => setNotificationsOpen(false)}
                            className='text-[#a89060] transition hover:text-[#fff3b0]'
                        >
                            Close
                        </button>
                    </div>
                    <div className='mt-4 max-h-72 space-y-3 overflow-y-auto pr-1'>
                        {previewNotifications.length > 0 ? previewNotifications.map((notification) => (
                            <div key={notification.id} className='border border-[#483d30] bg-[#1a0f10] p-3 text-sm text-[#f1e2ba]'>
                                <div className='flex items-center justify-between gap-2'>
                                    <span className='font-semibold text-[#fff3b0]'>{notification.title}</span>
                                    {!notification.read ? <span className='h-2 w-2 rounded-full bg-[#e09f3e]' /> : null}
                                </div>
                                <p className='mt-2 text-[#a89060]'>{notification.message}</p>
                            </div>
                        )) : (
                            <div className='border border-[#483d30] bg-[#1a0f10] p-3 text-sm text-[#a89060]'>
                                No notifications yet.
                            </div>
                        )}
                    </div>
                    <div className='mt-4 flex gap-2'>
                        <button
                            type='button'
                            onClick={() => markAllNotificationsRead()}
                            className='flex-1 border border-[#fff3b0] px-3 py-2 text-sm font-semibold text-[#fff3b0] transition hover:bg-[#fff3b0] hover:text-[#1a0f10]'
                        >
                            Mark all read
                        </button>
                        <button
                            type='button'
                            onClick={() => clearNotifications()}
                            className='flex-1 border border-[#483d30] px-3 py-2 text-sm font-semibold text-[#fff3b0] transition hover:border-[#fff3b0]'
                        >
                            Clear
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    </header>
    );
};

export default Header;