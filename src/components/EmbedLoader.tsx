import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import logo from '@/assets/vitalityx-logo.jpg';

const EmbedLoader = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Branded Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center gap-4">
          <motion.img
            src={logo}
            alt="VitalityX"
            className="h-10 w-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="flex-1 p-6">
        {/* Animated Logo Pulse */}
        <div className="flex flex-col items-center justify-center py-12">
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-secondary/20 rounded-full blur-xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.img
              src={logo}
              alt="VitalityX"
              className="h-16 w-auto relative z-10"
              animate={{ 
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          <motion.p
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Loading your portal...
          </motion.p>

          {/* Loading Dots */}
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-secondary"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>

        {/* Skeleton Cards Preview */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default EmbedLoader;