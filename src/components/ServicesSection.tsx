import { motion } from 'framer-motion';
import { 
  Dna, 
  TestTube, 
  Brain, 
  Apple, 
  Dumbbell, 
  Pill,
  Smartphone,
  Users
} from 'lucide-react';

const services = [
  {
    icon: Dna,
    title: 'Genetic Panel Testing',
    description: 'Comprehensive DNA analysis revealing your genetic predispositions, mutations, and how they affect your lifestyle, diet, and fitness requirements.',
    highlight: 'Your Blueprint',
  },
  {
    icon: TestTube,
    title: 'Lab Testing & Analysis',
    description: 'Advanced bloodwork and biomarker testing to identify vitamin deficiencies, hormonal imbalances, and metabolic factors affecting your health.',
    highlight: 'Your Baseline',
  },
  {
    icon: Brain,
    title: 'Health & Mental Wellness Coaching',
    description: 'One-on-one sessions with certified coaches who understand the connection between your genetics and mental well-being.',
    highlight: 'Your Mindset',
  },
  {
    icon: Apple,
    title: 'Personalized Nutrition',
    description: 'Custom meal plans and nutritionist consultations based on your genetic makeup and identified deficiencies—not generic advice.',
    highlight: 'Your Fuel',
  },
  {
    icon: Dumbbell,
    title: 'Virtual Personal Training',
    description: 'Live training sessions and an archive of workouts tailored to how your body responds to different exercise types.',
    highlight: 'Your Movement',
  },
  {
    icon: Pill,
    title: 'Custom Supplements',
    description: 'Premium-quality supplements formulated specifically to address your unique vitamin and mineral deficiencies.',
    highlight: 'Your Support',
  },
  {
    icon: Smartphone,
    title: 'Personal Client Portal',
    description: 'Access your complete health profile, workouts, meal plans, and progress tracking—all from our intuitive mobile app.',
    highlight: 'Your Command Center',
  },
  {
    icon: Users,
    title: 'Ongoing Support Team',
    description: 'A dedicated team of health professionals who know your file, your goals, and your genetic profile inside and out.',
    highlight: 'Your Team',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-4 block">
            What We Do
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            A Complete Journey, Not Just Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every piece works together. Your genetics inform your nutrition. Your labs guide your supplements. 
            Your coaching drives your training. Nothing is disconnected.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="group glass-card rounded-2xl p-6 hover:border-secondary/50 transition-all duration-500 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <service.icon className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-secondary text-xs font-bold tracking-wider uppercase">
                {service.highlight}
              </span>
              <h3 className="text-xl font-bold mt-2 mb-3 group-hover:text-secondary transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
