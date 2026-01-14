import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Users, DollarSign, TrendingUp, Gift, CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { toast } from 'sonner';

const benefits = [
  {
    icon: DollarSign,
    title: 'Competitive Commissions',
    description: 'Earn generous commissions on every referral that converts to a paying customer.',
  },
  {
    icon: Users,
    title: 'Exclusive Community',
    description: 'Join a network of health enthusiasts and wellness advocates who share your passion.',
  },
  {
    icon: TrendingUp,
    title: 'Marketing Resources',
    description: 'Access professional marketing materials, banners, and content to help you succeed.',
  },
  {
    icon: Gift,
    title: 'Special Perks',
    description: 'Enjoy exclusive discounts, early access to new products, and special bonuses.',
  },
];

const steps = [
  { step: '01', title: 'Apply', description: 'Fill out the application form below to get started.' },
  { step: '02', title: 'Get Approved', description: 'Our team will review your application within 48 hours.' },
  { step: '03', title: 'Share', description: 'Receive your unique referral link and marketing materials.' },
  { step: '04', title: 'Earn', description: 'Start earning commissions on every successful referral.' },
];

const Affiliate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    socialMedia: '',
    audience: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Application submitted successfully! We\'ll be in touch within 48 hours.');
    setFormData({
      name: '',
      email: '',
      website: '',
      socialMedia: '',
      audience: '',
      message: '',
    });
    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>Affiliate Program | VitalityX Health</title>
        <meta name="description" content="Join the VitalityX Health affiliate program and earn commissions by sharing our science-backed health optimization solutions." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background pt-24">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 to-transparent" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-secondary font-medium tracking-wide uppercase text-sm">
                Partner With Us
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mt-4 mb-6">
                Become a VitalityX
                <span className="text-secondary block">Affiliate</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our affiliate program and help others optimize their health while earning 
                competitive commissions. Partner with a brand that's transforming lives through 
                personalized wellness.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Partner With Us?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We provide everything you need to succeed as an affiliate partner.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 text-center hover:border-secondary/50 transition-colors"
                >
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Getting started is simple. Follow these four easy steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-8">
              {steps.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center relative"
                >
                  <div className="text-6xl font-bold text-secondary/20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-secondary/30 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="py-20 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Apply Now
                </h2>
                <p className="text-muted-foreground">
                  Ready to start earning? Fill out the form below and we'll get back to you within 48 hours.
                </p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="bg-card border border-border/50 rounded-2xl p-8 space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website/Blog URL</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia">Primary Social Media</Label>
                    <Input
                      id="socialMedia"
                      value={formData.socialMedia}
                      onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                      placeholder="@yourhandle"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Tell us about your audience *</Label>
                  <Textarea
                    id="audience"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    required
                    placeholder="Describe your audience size, demographics, and engagement..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Why do you want to partner with VitalityX?</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us why you're interested in our affiliate program..."
                    rows={3}
                  />
                </div>

                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <p>
                    By submitting this application, you agree to our affiliate terms and conditions. 
                    We'll review your application and respond within 48 hours.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </motion.form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Affiliate;
