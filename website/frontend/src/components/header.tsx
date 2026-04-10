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
    const [isLogged] = React.useState(true);
    return (
    <header className='bg-[#1a0f10] flex h-22 border-b-3 border-[#fff3b0] justify-center'>
        <div className='flex w-[80%] justify-self-center'>
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
                {navItems.map(({ label, icon }) => (
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
                <div className='flex-1 place-items-end'>
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
                </div>
            </div>
        </div>
    </header>
    );
};

export default Header;