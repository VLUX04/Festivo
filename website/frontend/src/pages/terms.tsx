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
                    <h1 className='text-7xl font-bold text-[#fff3b0] mt-5'>TERMS OF SERVICE</h1>
                    <p className='text-2xl text-[#a88e5d] my-10'>Our commitment to transparency and your rights</p>
                    <p className='py-6 px-8 text-xl text-[#fff3b0] border-3 border-[#fff3b0] bg-[#1a0f10]'>
                        Please read these terms carefully before using Festivo. By accessing our platform, you agree to be bound by these terms and conditions. <br /> <br />Last updated: March 13, 2026.
                    </p>
                  </div>
            </section>
            <section className={sectionStyle}>
                <h2 className={sectionTitleStyle}>1. Acceptance of Terms</h2>
                <p className={textStyle}>
                    By creating an account and using Festivo, you agree to these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you may not use our services.
                </p>
                <p className={textStyle}>
                    Festivo reserves the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the modified terms.
                </p>
            </section>
            <section className={sectionStyle}>
                <h2 className={sectionTitleStyle}>2. User Accounts & Responsibilities</h2>
                <p className={textStyle}>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration.
                </p>
                <p className='text-[#a88e5d] font-semibold mb-3'>You agree to:</p>
                <ul className='list-disc list-inside text-[#a88e5d] ml-5 space-y-2'>
                    <li>Be at least 16 years old to use Festivo</li>
                    <li>Provide truthful information about yourself</li>
                    <li>Not share your account with others</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Not use the platform for illegal or unauthorized purposes</li>
                </ul>
            </section>
            <section className={sectionStyle}>
                <h2 className={sectionTitleStyle}>3. Privacy & Data Protection</h2>
                <p className={textStyle}>
                    Your privacy is important to us. We collect and process personal data in accordance with GDPR and Portuguese data protection laws.
                </p>
                <p className='text-[#a88e5d] font-semibold mb-3'>We collect:</p>
                <ul className='list-disc list-inside text-[#a88e5d] ml-5 space-y-2 mb-4'>
                    <li>Profile information (name, email, location, photo)</li>
                    <li>Event attendance and preferences</li>
                    <li>Social interactions and content you share</li>
                    <li>Usage data and analytics</li>
                </ul>
                <p className={textStyle}>
                    Your data is used to provide services, improve the platform, and send relevant event recommendations. You can request data deletion at any time by contacting privacy@festivo.pt.
                </p>
            </section>
            <section className={sectionStyle}>
                <h2 className={sectionTitleStyle}>4. User Content & Conduct</h2>
                <p className={textStyle}>
                    You retain ownership of content you post on Festivo, but grant us a license to use, display, and distribute it on our platform.
                </p>
                <p className='text-[#a88e5d] font-semibold mb-3'>Prohibited content includes:</p>
                <ul className='list-disc list-inside text-[#a88e5d] ml-5 space-y-2 mb-4'>
                    <li>Harassment, hate speech, or discriminatory content</li>
                    <li>Spam, misleading information, or scams</li>
                    <li>Copyright or trademark infringement</li>
                    <li>Explicit sexual content or violence</li>
                    <li>Content that violates Portuguese or EU law</li>
                </ul>
                <p className={textStyle}>
                    We reserve the right to remove content and suspend accounts that violate these guidelines.
                </p>
            </section>
            <section className={sectionStyle}>
                <h2 className={sectionTitleStyle}>5. Intellectual Property</h2>
                <p className={textStyle}>
                    The Festivo platform, including its design, features, code, and branding, is owned by Festivo and protected by copyright and trademark laws.
                </p>
                <p className='text-[#a88e5d] font-semibold mb-3'>You may not:</p>
                <ul className='list-disc list-inside text-[#a88e5d] ml-5 space-y-2 mb-4'>
                    <li>Copy, modify, or distribute our platform code</li>
                    <li>Use our name, logo, or branding without permission</li>
                    <li>Scrape or automated data collection from our platform</li>
                    <li>Reverse engineer our systems</li>
                </ul>
                <p className={textStyle}>
                    Event information and venue details are provided by third parties and remain their property.
                </p>
            </section>
            <section className={sectionStyle}>
                <h2 className={sectionTitleStyle}>6. Limitation of Liability</h2>
                <p className={textStyle}>
                    Festivo is provided "as is" without warranties of any kind. We strive for accuracy but cannot guarantee:
                </p>
                <ul className='list-disc list-inside text-[#a88e5d] ml-5 space-y-2 mb-4'>
                    <li>Event information accuracy or completeness</li>
                    <li>Platform availability or uptime</li>
                    <li>Third-party venue or artist reliability</li>
                </ul>
                <p className='text-[#a88e5d] font-semibold mb-3'>We are not liable for:</p>
                <ul className='list-disc list-inside text-[#a88e5d] ml-5 space-y-2 mb-4'>
                    <li>Canceled, modified, or misrepresented events</li>
                    <li>Injuries or damages at events</li>
                    <li>Lost profits or indirect damages</li>
                    <li>Third-party actions or content</li>
                </ul>
                <p className={textStyle}>
                    Our liability is limited to the amount you paid to Festivo in the past 12 months (if applicable).
                </p>
            </section>
            <section className='flex justify-center border-b-3 border-[#fff3b0] mt-20 border-t-3 pt-5'>
                <div className='w-[48%] mb-30 flex flex-col items-center'>
                    <h1 className='text-4xl font-bold text-[#fff3b0] mt-5 text-center'>Questions About Our Terms?</h1>
                    <p className='text-xl text-[#a88e5d] my-10 text-center'>We're here to help clarify any concerns you may have.</p>
                    <Link to="/contact" className='inline-flex transition duration-333 ease-in-out py-4 px-8 bg-[#fff3b0] font-semibold border-2 border-[#fff3b0] hover:bg-[#1a0f10] hover:text-[#fff3b0]'>Contact Us</Link>
                </div>
            </section>
        </div>
    </PageLayout>
  );
};

export default TermsPage;