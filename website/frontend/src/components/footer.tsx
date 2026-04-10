import '../style.css'
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
    <footer className='bg-[#1a0f10] bottom-0 flex h-22 border-t-3 border-[#fff3b0] justify-center'>
        <div className='flex flex-row w-[80%]'>
            <div className='place-content-center text-[#a89060]'>
                © 2026 Festivo. All rights reserved.
            </div>
            <div className='place-content-center ml-auto'>
                <Link to="/about" className='ml-10 text-[#a89060] hover:text-[#fff3b0]'>About</Link>
                <Link to="/terms" className='ml-10 text-[#a89060] hover:text-[#fff3b0]'>Terms</Link>
                <Link to="/contact" className='ml-10 text-[#a89060] hover:text-[#fff3b0]'>Contact</Link>
            </div>
        </div>
    </footer>
);

export default Footer;