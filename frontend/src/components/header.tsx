import '../style.css'
import React from 'react';

const navItems = ['Events', 'Friends', 'Social', 'Work', 'Map'];
const navButtonClass = 'transition duration-333 ease-in-out border-2 border-[#483d30] h-1/2 px-5 text-[#fff3b0] hover:bg-[#553a1e] hover:border-[#fff3b0] hover:cursor-pointer active:bg-[#fff3b0] active:text-[#1a0f10]';

const Header: React.FC = () => (
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
                {navItems.map((item) => (
                    <div className='flex-1 flex justify-center place-items-center'>
                        <button key={item} className={navButtonClass}>{item}</button>
                    </div>
                ))}
            </div>
            <div className='bg-green-300  flex-1'>
                
            </div>
        </div>
    </header>
);

export default Header;