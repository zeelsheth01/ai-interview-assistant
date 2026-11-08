import AnnouncementBar from '../components/landing/AnnouncementBar';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import MultilingualSection from '../components/landing/MultilingualSection';
import DesiMode from '../components/landing/DesiMode';
import DemoSection from '../components/landing/DemoSection';
import Testimonials from '../components/landing/Testimonials';
import Platforms from '../components/landing/Platforms';
import ResumeBuilder from '../components/landing/ResumeBuilder';
import Comparison from '../components/landing/Comparison';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-canvas text-ink-primary font-sans antialiased selection:bg-primary selection:text-white">
      <AnnouncementBar />
      <Navbar />
      <main>
        <Hero />
        <DemoSection />
        <DesiMode />
        <ResumeBuilder />
        <MultilingualSection />
        <Comparison />
        <Platforms />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
