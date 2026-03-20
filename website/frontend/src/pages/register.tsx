import React from 'react';
import registerLogin from '../icons/register.png';

const RegisterPage: React.FC = () => {
  return (
    <div className='w-[28em] h-auto pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#fff3b0] text-center flex flex-col shadow-[15px_15px_0_0_#231c16]'>
        <h1 className='text-5xl font-bold text-[#fff3b0] mt-5'>JOIN FESTIVO</h1>
        <p className='text-[#a89060] mt-5'>Create your account to start discovering events</p>
        <div className='flex w-[85%] flex-col text-start mt-5 place-self-center'>
            <span className='text-[#fff3b0] font-semibold mb-2'>NAME</span>
            <input className='border-2 border-[#483d30] placeholder-[#8d8059] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] ' type="email" placeholder='Your Name'/>
        </div>
        <div className='flex w-[85%] flex-col text-start mt-5 place-self-center'>
            <span className='text-[#fff3b0] font-semibold mb-2'>EMAIL</span>
            <input className='border-2 border-[#483d30] placeholder-[#8d8059] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] ' type="email" placeholder='you@example.com'/>
        </div>
        <div className='flex w-[85%] flex-col text-start mt-5 place-self-center'>
            <span className='text-[#fff3b0] font-semibold mb-2'>PASSWORD</span>
            <input className='border-2 border-[#483d30] placeholder-[#8d8059] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] ' type="password" placeholder='********'/>
        </div>
        <div>
            <button type="submit" className="group transition duration-250 ease-in-out w-[85%] py-3 mt-6 mb-8 bg-[#fff3b0] hover:bg-[#1a0f10] border-3 border-[#fff3b0] place-self-center flex items-center justify-center gap-2">
                <img src={registerLogin} alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
                <span className='text-[#540b0e] group-hover:text-[#fff3b0]'>CREATE ACCOUNT</span>
            </button>
        </div>
        <div className='bg-[#483d30] w-[85%] h-[1.5px] place-self-center'></div>
        <p className='text-[#a89060] mt-7'>Already have an account?</p>
        <div className='justify-center mt-7 mb-10'>
            <a href="/login" className='transition duration-250 ease-in-out py-3 px-7 border-2 border-[#483d30] hover:border-[#fff3b0] text-[#fff3b0]'>LOGIN</a>
        </div>
    </div>
  );
};

export default RegisterPage;