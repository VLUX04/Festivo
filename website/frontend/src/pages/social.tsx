import React from 'react';
import PageLayout from '../components/pageLayout'
import { posts, socialStats, stories, trendingEvents } from '../data/socialTempData'

const SocialPage: React.FC = () => {
  return (
    <PageLayout>
      <div className='mx-auto w-[82%] py-6'>
        <div className='grid w-full grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]'>
          <section className='space-y-6'>
            <div className='border-4 border-[#483d30] bg-[#1a0b10] p-4'>
              <div className='flex flex-wrap gap-5'>
                {stories.map((story) => (
                  <div key={story.name} className='flex w-[84px] flex-col items-center'>
                    <div className='relative'>
                      <img
                        src={story.image}
                        alt={story.name}
                        className='h-[74px] w-[74px] rounded-full border-3 border-[#f4de9a] object-cover'
                      />
                      {story.isOwn && (
                        <span className='absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1a0b10] bg-[#f4de9a] text-xl text-[#5f0f12]'>
                          +
                        </span>
                      )}
                    </div>
                    <span className='mt-2 w-full truncate text-center text-[15px] font-semibold text-[#f6e8ab]'>
                      {story.name}
                    </span>
                  </div>
                ))}
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
              {posts.map((post) => (
                <article key={post.author + post.timeAgo} className='border-4 border-[#483d30] bg-[#1a0b10]'>
                  <div className='flex items-center justify-between border-b border-[#604f31] px-5 py-4'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className='h-[52px] w-[52px] rounded-full border-2 border-[#f4de9a] object-cover'
                      />
                      <div>
                        <h3 className='text-[24px] font-extrabold text-[#ffe9a8]'>{post.author}</h3>
                        <p className='text-[16px] text-[#bf9a57]'>
                          @ {post.venue} • {post.timeAgo}
                        </p>
                      </div>
                    </div>
                    <span className='text-[22px] text-[#f6e8ab]'>⋮</span>
                  </div>

                  <div className='relative'>
                    <img
                      src={post.image}
                      alt={`${post.author} post`}
                      className='h-[380px] w-full object-cover md:h-[520px]'
                    />
                    <button className='absolute right-5 top-5 flex h-12 w-12 items-center justify-center bg-[#efe6ae] text-[26px] text-[#5f0f12]'>
                      ▶
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className='border-4 border-[#483d30] bg-[#1a0b10] p-6'>
            <h2 className='mb-5 text-[30px] font-extrabold text-[#f6e8ab]'>
              ⌁ Trending Events
            </h2>

            <div className='space-y-3'>
              {trendingEvents.map((event) => (
                <div key={event.rank} className='flex items-center justify-between border-2 border-[#604f31] px-3 py-3'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center bg-[#efe6ae] text-[22px] font-extrabold text-[#5f0f12]'>
                      {event.rank}
                    </div>
                    <div>
                      <h3 className='text-[21px] font-bold text-[#ffe9a8]'>{event.name}</h3>
                      <p className='text-[17px] text-[#bf9a57]'>
                        ⚇ {event.going} going
                      </p>
                    </div>
                  </div>
                  <span className='text-[22px] text-[#d3ab4c]'>↗</span>
                </div>
              ))}
            </div>

            <div className='my-6 h-px bg-[#604f31]' />

            <div className='space-y-3'>
              <div className='flex items-center justify-between text-[22px]'>
                <span className='text-[#bf9a57]'>Posts Today</span>
                <span className='font-bold text-[#ffe9a8]'>{socialStats.postsToday}</span>
              </div>
              <div className='flex items-center justify-between text-[22px]'>
                <span className='text-[#bf9a57]'>Active Users</span>
                <span className='font-bold text-[#ffe9a8]'>{socialStats.activeUsers}</span>
              </div>
              <div className='flex items-center justify-between text-[22px]'>
                <span className='text-[#bf9a57]'>Events Shared</span>
                <span className='font-bold text-[#ffe9a8]'>{socialStats.eventsShared}</span>
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
