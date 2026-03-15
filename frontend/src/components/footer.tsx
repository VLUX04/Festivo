import '../style.css'
import React from 'react';

const Footer: React.FC = () => (
    <footer className='bg-[#1a0f10] bottom-full flex h-22 border-b-3 border-[#fff3b0] justify-center'>
        <div className='flex flex-row w-[80%]'>
            <div className='place-content-center text-[#a89060]'>
                © 2026 Festivo. All rights reserved.
            </div>
            <div className='place-content-center ml-auto'>
                <a className='ml-10 text-[#a89060] hover:text-[#fff3b0]' href="">About</a>
                <a className='ml-10 text-[#a89060] hover:text-[#fff3b0]' href="">Terms</a>
                <a className='mx-10 text-[#a89060] hover:text-[#fff3b0]' href="">Contact</a>
            </div>
        </div>
    </footer>
);

export default Footer;