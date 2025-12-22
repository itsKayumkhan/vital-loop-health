import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ServicesSection from '@/components/ServicesSection';
import WhyUsSection from '@/components/WhyUsSection';
import ForYouSection from '@/components/ForYouSection';
import PricingPreview from '@/components/PricingPreview';
import SupplementsSection from '@/components/SupplementsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>VitalityX Health | Genetics. Wellness. Optimized.</title>
        <meta 
          name="description" 
          content="The first closed-loop health system. Genetic testing, personalized nutrition, custom supplements, and virtual training—all designed around your unique DNA." 
        />
        <meta name="keywords" content="genetic testing, personalized health, wellness coaching, DNA analysis, custom supplements, virtual personal training" />
        <link rel="canonical" href="https://vitalityxhealth.com" />
      </Helmet>
      
      <main className="min-h-screen">
        <Navbar />
        <HeroSection />
        <ServicesSection />
        <WhyUsSection />
        <ForYouSection />
        <PricingPreview />
        <SupplementsSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
};

export default Index;
