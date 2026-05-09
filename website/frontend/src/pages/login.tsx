import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginIcon from '../icons/login.png';
import PageLayout from '../components/pageLayout'
import { setAuthSession } from '../utils/auth';

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
  const [formData, setFormData] = useState({
	  credential: '',
	  password: ''
  });

  const handleChange = (e: any) => {
	  const { name, value } = e.target;
	  setFormData(prevData => ({
		  ...prevData,
		  [name]: value
	  }));
  }

  
  const handleSubmit = async (e: any) => {
	  e.preventDefault();
	  // basic validation
	  if (!formData.credential || !formData.password ) {
		  alert("Filling in all the fields is necessary.");
		  return;
	  }
	  
	  try {
		  const response = await fetch('http://localhost:3000/login' ,{ //WARNING: localhost != 0.0.0.0 - ISMA
			  method: 'POST',
		  	  headers: {
				  'Content-Type': 'application/json',
			  }	,
			  body: JSON.stringify(formData)
		  });

		  const data = await response.json();

		  if (data.success) {
			  alert("Login successful!");
              setAuthSession(data.token, {
                  username: data.user.username,
                  name: data.user.name,
                  email: data.user.email,
                  role: data.user.role
              });
			  handleReset();
			  navigate('/profile');
		  } else {
			  alert(data.message || "Login failed.")
		  }
	  } catch (err) {
		console.error('Error: ', err);
		alert('Login failed. Please try again.');
	  }
  }

  const handleReset = () => {
	  setFormData({
	  	  credential: '',
		  password: ''
	  });
  }

  return (
    <PageLayout>
        <div className='w-[28em] h-auto pt-5 m-7 self-center bg-[#1a0f10] border-3 border-[#fff3b0] text-center flex flex-col shadow-[15px_15px_0_0_#231c16]'>
		<form onSubmit={handleSubmit}>
            <h1 className='text-5xl font-bold text-[#fff3b0] mt-5'>WELCOME BACK</h1>
            <p className='text-[#a89060] mt-5'>Login to continue your cultural jorney</p>

            <div className='flex w-[85%] flex-col text-start mt-5 place-self-center'>
                <span className='text-[#fff3b0] font-semibold mb-2'>EMAIL or USERNAME</span>
                <input name="credential" value={formData.credential} onChange={handleChange} required className='border-2 border-[#483d30] placeholder-[#8d8059] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] ' type="text" placeholder='you@example.com'/>
            </div>

            <div className='flex w-[85%] flex-col text-start mt-5 place-self-center'>
                <span className='text-[#fff3b0] font-semibold mb-2'>PASSWORD</span>
                <input name="password" value={formData.password} onChange={handleChange} required className='border-2 border-[#483d30] placeholder-[#8d8059] p-3 text-[#fff3b0] outline-none focus:border-[#fff3b0] ' type="password" placeholder='********'/>
            </div>

            <div>
                <button type="submit" className="group transition duration-250 ease-in-out w-[85%] py-3 mt-6 mb-8 bg-[#fff3b0] hover:bg-[#1a0f10] border-3 border-[#fff3b0] place-self-center flex items-center justify-center gap-2">
                    <img src={loginIcon} alt="" className="h-5 w-5 object-contain" aria-hidden="true" />
                    <span className='text-[#540b0e] group-hover:text-[#fff3b0]'>LOGIN</span>
                </button>
            </div>

            <div className='bg-[#483d30] w-[85%] h-[1.5px] place-self-center'></div>
            <p className='text-[#a89060] mt-7'>Don't have an account?</p>
            <div className='justify-center mt-7 mb-10'>
                <a href="/register" className='transition duration-250 ease-in-out py-3 px-7 border-2 border-[#483d30] hover:border-[#fff3b0] text-[#fff3b0]'>SIGN UP</a>
            </div>
		</form>
        </div>
    </PageLayout>
  );
};

export default LoginPage;
