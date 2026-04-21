import React from 'react';
import Header from './header.tsx';
import Footer from './footer.tsx';

type PageLayoutProps = {
  children: React.ReactNode;
  mainClassName?: string;
};

const PageLayout: React.FC<PageLayoutProps> = ({ children, mainClassName = '' }) => (
  <div className='app'>
    <Header />
    <main className={'content flex flex-col justify-center ' + mainClassName}>
      {children}
    </main>
    <Footer />
  </div>
);

export default PageLayout;
