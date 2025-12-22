import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  age: number;
  location: string;
  discovery: string;
  quote: string;
  outcome: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Mitchell",
    age: 42,
    location: "Austin, TX",
    discovery: "MTHFR Gene Variant",
    quote: "For years I struggled with fatigue and brain fog that no doctor could explain. VitalityX discovered I have an MTHFR mutation affecting my folate metabolism. Within weeks of starting their personalized methylated B-vitamin protocol, I felt like a completely different person. My energy is back, my mind is sharp, and I finally understand my body.",
    outcome: "Energy levels increased 300%"
  },
  {
    name: "Marcus Johnson",
    age: 38,
    location: "Denver, CO",
    discovery: "APOE4 Cardiovascular Risk",
    quote: "My father had a heart attack at 45. VitalityX identified that I carry the APOE4 variant, putting me at elevated cardiovascular risk. Their nutrition plan and targeted supplements have helped me optimize my cholesterol naturally. My cardiologist was amazed at my latest bloodwork. This program literally could have saved my life.",
    outcome: "LDL cholesterol reduced by 40%"
  },
  {
    name: "Jennifer Chen",
    age: 35,
    location: "Seattle, WA",
    discovery: "Caffeine Metabolism Gene",
    quote: "I always wondered why coffee made me anxious while my husband could drink it all day. My genetic test revealed I'm a slow caffeine metabolizer. VitalityX adjusted my entire supplement timing and helped me find alternatives. The personalized approach transformed my mornings and eliminated my afternoon crashes.",
    outcome: "Anxiety symptoms reduced 80%"
  },
  {
    name: "David Rodriguez",
    age: 51,
    location: "Miami, FL",
    discovery: "Vitamin D Receptor Variation",
    quote: "Despite living in sunny Florida and taking supplements, my vitamin D was always low. VitalityX discovered I have a vitamin D receptor gene variant that affects absorption. Their customized high-dose protocol with specific cofactors finally got my levels optimal. My joint pain disappeared and my immune system has never been stronger.",
    outcome: "Vitamin D levels normalized in 8 weeks"
  },
  {
    name: "Amanda Foster",
    age: 29,
    location: "Chicago, IL",
    discovery: "Lactose & Gluten Sensitivity Genes",
    quote: "I spent my twenties with constant bloating and digestive issues. Every elimination diet gave mixed results. VitalityX pinpointed my exact genetic food sensitivities—I carry genes for both lactose intolerance and gluten sensitivity. Their personalized nutrition plan and digestive enzyme protocol changed everything. I can finally enjoy meals without fear.",
    outcome: "Digestive symptoms eliminated"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-secondary text-sm font-semibold tracking-widest uppercase mb-4 block">
            Real Results
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <span className="text-gradient-hero">Lives Transformed</span>{' '}
            <span className="text-gradient">By Genetic Insights</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how our clients uncovered hidden genetic factors and achieved breakthrough health results.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 flex flex-col h-full group hover:border-secondary/50 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-secondary/30 mb-4" />
              
              {/* Discovery Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-4 w-fit">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="text-secondary text-xs font-medium">{testimonial.discovery}</span>
              </div>

              {/* Quote */}
              <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-6">
                "{testimonial.quote}"
              </p>

              {/* Outcome */}
              <div className="bg-secondary/10 rounded-lg px-4 py-3 mb-6">
                <span className="text-secondary font-semibold text-sm">{testimonial.outcome}</span>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div>
                  <p className="text-foreground font-semibold">{testimonial.name}</p>
                  <p className="text-muted-foreground text-sm">
                    Age {testimonial.age} • {testimonial.location}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-2">
            Join over <span className="text-secondary font-bold">1,000+ clients</span> who've discovered their genetic potential
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
