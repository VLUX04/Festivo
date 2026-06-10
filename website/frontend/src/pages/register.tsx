import React from 'react';
import { useState } from 'react';
import PageLayout from '../components/pageLayout';
import registerLogin from '../icons/register.png';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { saveRegistration } = useRegistration();
  const [formData, setFormData] = useState({ username: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(formData.username)) {
      setError('Username can only contain lowercase letters, numbers and dashes.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        saveRegistration({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        navigate('/account');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout mainClassName='items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md border-4 border-[#fff3b0] bg-[#1a0f10]'>
        <form onSubmit={handleSubmit} className='flex flex-col px-10 py-10'>
          <h1 className='text-5xl font-bold text-[#fff3b0]'>JOIN FESTIVO</h1>
          <p className='text-[#a89060] mt-3'>Create your account to start discovering events.</p>

          <div className='flex flex-col mt-7'>
            <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[#fff3b0] mb-2'>Username</span>
            <input
              name='username'
              value={formData.username}
              onChange={handleChange}
              required
              placeholder='your-handle'
              className='border-2 border-[#483d30] bg-[#120707] p-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
            />
          </div>

          <div className='flex flex-col mt-5'>
            <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[#fff3b0] mb-2'>Name</span>
            <input
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              placeholder='Your Name'
              className='border-2 border-[#483d30] bg-[#120707] p-3 text-[#fff3b0] placeholder-[#7e6a4a] outline-none focus:border-[#fff3b0]'
            />
          </div>

          <div className='flex flex-col mt-5'>
            <span className='text-xs font-semibold uppercase tracking-[0.2em] text-[#fff3b0] mb-2'>Email</span>
            <input
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              type='email'
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
            <img src={registerLogin} alt='' className='h-5 w-5 object-contain' aria-hidden='true' />
            {submitting ? 'Creating...' : 'Create Account'}
          </button>

          <div className='my-7 h-px bg-[#483d30]' />

          <p className='text-center text-[#a89060]'>Already have an account?</p>
          <a
            href='/login'
            className='mt-4 flex items-center justify-center border-2 border-[#483d30] py-3 font-bold text-[#fff3b0] transition hover:border-[#fff3b0]'
          >
            Login
          </a>
        </form>
      </div>
    </PageLayout>
  );
};

export default RegisterPage;
