import React from 'react';
import PageLayout from '../components/pageLayout'

const SocialPage: React.FC = () => {
  return (
    <PageLayout>
      <div className='mx-auto w-[82%] py-6'>
        <div className='grid w-full grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]'>
          <section className='space-y-6'>
            <div className='border-4 border-[#483d30] bg-[#1a0b10] p-4'>
              <div className='flex flex-wrap gap-5'>
                <span className='text-[15px] font-semibold text-[#9f8a58]'>No stories yet.</span>
              </div>
            </div>

            <div className='border-4 border-[#483d30] bg-[#1a0b10] p-2'>
              <div className='grid grid-cols-3 gap-2'>
                <button className='bg-[#efe6ae] px-3 py-3 text-[15px] font-extrabold tracking-wide text-[#5f0f12]'>
                  ALL POSTS
                </button>
                <button className='px-3 py-3 text-[15px] font-extrabold tracking-wide text-[#f6e8ab]'>
                  FRIENDS
                </button>
                <button className='px-3 py-3 text-[15px] font-extrabold tracking-wide text-[#f6e8ab]'>
                  TRENDING
                </button>
              </div>
            </div>

            <div className='border-4 border-[#483d30] bg-[#1a0b10] px-5 py-4'>
              <div className='flex items-center gap-3'>
                <span className='text-[20px] text-[#b89e62]'>⌕</span>
                <span className='text-[18px] font-semibold text-[#9f8a58]'>Search posts...</span>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='border-4 border-[#483d30] bg-[#1a0b10] px-5 py-8 text-center text-[#9f8a58]'>
                No posts available yet.
              </div>
            </div>
          </section>

          <aside className='border-4 border-[#483d30] bg-[#1a0b10] p-6'>
            <h2 className='mb-5 text-[30px] font-extrabold text-[#f6e8ab]'>
              ⌁ Trending Events
            </h2>

            <div className='space-y-3'>
              <div className='border-2 border-[#604f31] px-3 py-6 text-center text-[#9f8a58]'>
                No trending events yet.
              </div>
            </div>

            <div className='my-6 h-px bg-[#604f31]' />

            <div className='space-y-3'>
              <div className='flex items-center justify-between text-[22px]'>
                <span className='text-[#bf9a57]'>Posts Today</span>
                <span className='font-bold text-[#ffe9a8]'>0</span>
              </div>
              <div className='flex items-center justify-between text-[22px]'>
                <span className='text-[#bf9a57]'>Active Users</span>
                <span className='font-bold text-[#ffe9a8]'>0</span>
              </div>
              <div className='flex items-center justify-between text-[22px]'>
                <span className='text-[#bf9a57]'>Events Shared</span>
                <span className='font-bold text-[#ffe9a8]'>0</span>
              </div>
            </div>

            <button className='mt-8 w-full bg-[#efe6ae] px-4 py-4 text-[24px] font-extrabold tracking-wide text-[#5f0f12]'>
              ✧ DISCOVER MORE
            </button>
          </aside>
        </div>
      </div>
    </PageLayout>
  );
};

export default SocialPage;
