import React from 'react';
import PageLayout from '../components/pageLayout'

const gridStyle = 'transition duration-333 ease-in-out border-2 bg-[#1a0f10] border-[#483d30] hover:border-[#fff3b0] h-[11em] p-4 flex flex-col'
const gridTitleStyle = 'text-2xl font-bold text-[#fff3b0] mb-3'
const gridtextStyle = 'text-[#a88e5d]'

const AboutPage: React.FC = () => {
  return (
    <PageLayout>
        <div className=' w-full'>
            <section className='flex justify-center border-b-3 border-[#fff3b0] mt-20'>
                  <div className='w-[48%] mb-30'>
                    <h1 className='text-7xl font-bold text-[#fff3b0] mt-5'>ABOUT FESTIVO</h1>
                    <p className='text-2xl text-[#a88e5d] my-10'>Connecting people through culture since 2023</p>
                    <p className='py-6 px-8 text-xl text-[#fff3b0] border-3 border-[#fff3b0] bg-[#1a0f10]'>
                        Festivo was born from a simple idea: culture should bring people together, not apart. We believe that every concert, exhibition, and gathering is an opportunity to discover something new and connect with others who share your passions.
                    </p>
                  </div>
            </section>
            <section className='flex flex-col w-[54%] my-20 place-self-center'>
                <h2 className='text-5xl font-bold text-[#fff3b0] mb-7'>OUR STORY</h2>
                <div className='grid grid-cols-2 gap-7'>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>The Beginning</h4>
                        <p className={gridtextStyle}>
                            In 2023, a group of cultural enthusiasts in Porto realized that discovering events was fragmented and difficult. Friends would miss concerts, artists struggled to reach audiences, and venues couldn't fill their spaces.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>The Vision</h4>
                        <p className={gridtextStyle}>
                            We envisioned a platform that would connect the entire cultural ecosystem: event lovers, artists, venues, and professionals. A place where discovering culture is as exciting as experiencing it.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Building Community</h4>
                        <p className={gridtextStyle}>
                            Festivo isn't just about events—it's about the people. We built features that help you see which friends are attending, share moments, and discover events through your network's experiences.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Supporting Culture</h4>
                        <p className={gridtextStyle}>
                            We created the Workspace to support cultural professionals, from sound engineers to curators. By connecting opportunities with talent, we strengthen the entire cultural sector.
                        </p>
                    </div>
                </div>
            </section>
            <section className='flex flex-col w-[54%] my-20 place-self-center'>
                <h2 className='text-5xl font-bold text-[#fff3b0] mb-7'>WHAT DRIVES US</h2>
                <div className='grid grid-cols-3 gap-7'>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Culture for All</h4>
                        <p className={gridtextStyle}>
                            We believe culture should be accessible to everyone, regardless of background or location.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Community First</h4>
                        <p className={gridtextStyle}>
                            Everything we build focuses on bringing people together and strengthening cultural communities.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Local Roots</h4>
                        <p className={gridtextStyle}>
                            We celebrate local culture while connecting communities across cities and countries.
                        </p>
                    </div>
                </div>
            </section>
                        <section className='flex flex-col w-[54%] my-20 place-self-center'>
                <h2 className='text-5xl font-bold text-[#fff3b0] mb-7'>YOUR SAFETY & PRIVACY</h2>
                <div className='grid grid-cols-2 gap-7'>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Data Protection</h4>
                        <p className={gridtextStyle}>
                            Your personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Privacy Controls</h4>
                        <p className={gridtextStyle}>
                            You control who sees your profile, events, and activity. Customize your privacy settings to match your comfort level.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Safe Community</h4>
                        <p className={gridtextStyle}>
                            We actively moderate content and verify venues. Report tools are always available to flag inappropriate behavior or content.
                        </p>
                    </div>
                    <div className={gridStyle}>
                        <h4 className={gridTitleStyle}>Secure Payments</h4>
                        <p className={gridtextStyle}>
                            All transactions are processed through encrypted, industry-standard payment providers. We never store your payment information.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    </PageLayout>
  );
};

export default AboutPage;