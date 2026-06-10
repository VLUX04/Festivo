import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/pageLayout';
import loginIcon from '../icons/login.png';
import { setAuthSession } from '../utils/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ credential: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setAuthSession(data.token, {
          id: data.user.id,
          username: data.user.username,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        navigate('/profile');
      } else {
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout mainClassName='items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md border-4 border-[#fff3b0] bg-[#1a0f10]'>
        <form onSubmit={handleSubmit} className='flex flex-col px-10 py-10'>
          <h1 className='text-5xl font-bold text-[#fff3b0]'>WELCOME BACK</h1>
          <p className='text-[#a89060] mt-3'>Login to continue your cultural journey.</p>

          <div className='flex flex-col mt-7'>
            <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[#fff3b0] mb-2'>Email or Username</span>
            <input
              name='credential'
              value={formData.credential}
              onChange={handleChange}
              required
              placeholder='you@example.com'
              className='border-2 border-[#483d30] bg-[#120707] p-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
            />
          </div>

          <div className='flex flex-col mt-5'>
            <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[#fff3b0] mb-2'>Password</span>
            <input
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
              type='password'
              placeholder='••••••••'
              className='border-2 border-[#483d30] bg-[#120707] p-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
            />
          </div>

          {error ? (
            <p className='mt-4 text-sm text-[#ff8f8f]'>{error}</p>
          ) : null}

          <button
            type='submit'
            disabled={submitting}
            className='group mt-7 flex items-center justify-center gap-2 border-2 border-[#fff3b0] bg-[#fff3b0] py-3 font-bold text-[#540b0e] transition hover:bg-[#1a0f10] hover:text-[#fff3b0] disabled:opacity-60'
          >
            <img src={loginIcon} alt='' className='h-5 w-5 object-contain' aria-hidden='true' />
            {submitting ? 'Logging in...' : 'Login'}
          </button>

          <div className='my-7 h-px bg-[#483d30]' />

          <p className='text-center text-[#a89060]'>Don't have an account?</p>
          <a
            href='/register'
            className='mt-4 flex items-center justify-center border-2 border-[#483d30] py-3 font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'
          >
            Sign Up
          </a>
        </form>
      </div>
    </PageLayout>
  );
};

export default LoginPage;
