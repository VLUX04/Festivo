import React from 'react';
import { Link } from 'react-router-dom'
import PageLayout from '../components/pageLayout'

const sectionStyle = 'flex flex-col w-[54%] my-10 place-self-center transition duration-333 ease-in-out border-2 bg-[#1a0f10] border-[#483d30] hover:border-[#fff3b0] p-6'
const sectionTitleStyle = 'text-4xl font-bold text-[#fff3b0] mb-5 mt-8'
const textStyle = 'text-[#a88e5d] mb-4 leading-relaxed'

const TermsPage: React.FC = () => {
  return (
    <PageLayout>
        <div className='w-full'>
            <section className='flex justify-center border-b-3 border-[#fff3b0] mt-20'>
                  <div className='w-[48%] mb-30'>
                    <h1 className='text-7xl font-bold text-[#fff3b0] mt-5'>GET IN TOUCH</h1>
                    <p className='text-2xl text-[#a88e5d] my-10'>We'd love to hear from you</p>
                    <p className='py-6 px-8 text-xl text-[#fff3b0] border-3 border-[#fff3b0] bg-[#1a0f10]'>
                        Whether you have questions, feedback, or partnership proposals, our team is here to help. Reach out and we'll get back to you as soon as possible.
                    </p>
                  </div>
            </section>

            <section className='flex justify-center border-b-3 border-[#fff3b0] mt-20 border-t-3 pt-5'>
                <div className='w-[48%] mb-30 flex flex-col items-center'>
                    <h1 className='text-4xl font-bold text-[#fff3b0] mt-5 text-center'>FOLLOW US ON SOCIAL MEDIA</h1>
                    <p className='text-xl text-[#a88e5d] my-10 text-center'>Stay connected and join the cultural conversation</p>
                    <div className='grid grid-cols-4 gap-3'>
                        <a href="" className='transition duration-333 ease-in-out border-2 border-[#3b3527] hover:bg-[#2d1d14] hover:border-[#fff3b0] text-[#fff3b0] text-center py-4 px-6'>Instagram</a>
                        <a href="" className='transition duration-333 ease-in-out border-2 border-[#3b3527] hover:bg-[#2d1d14] hover:border-[#fff3b0] text-[#fff3b0] text-center py-4 px-6'>Facebool</a>
                        <a href="" className='transition duration-333 ease-in-out border-2 border-[#3b3527] hover:bg-[#2d1d14] hover:border-[#fff3b0] text-[#fff3b0] text-center py-4 px-6'>Twitter</a>
                        <a href="" className='transition duration-333 ease-in-out border-2 border-[#3b3527] hover:bg-[#2d1d14] hover:border-[#fff3b0] text-[#fff3b0] text-center py-4 px-6'>LinkedIn</a>
                    </div>
                </div>
            </section>
        </div>
    </PageLayout>
  );
};

export default TermsPage;