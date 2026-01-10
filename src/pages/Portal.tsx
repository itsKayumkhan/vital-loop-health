import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Utensils, 
  Dumbbell, 
  Moon, 
  Brain,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { coachForms } from '@/data/coachForms';

interface FormSubmission {
  id: string;
  specialty: string;
  status: string;
  submitted_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-500', icon: AlertCircle },
  assigned: { label: 'Coach Assigned', color: 'bg-purple-500/20 text-purple-500', icon: User },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 },
  archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-500', icon: FileText },
};

const Portal = () => {
  const { user, signOut, role, isStaff } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('coach_intake_forms')
        .select('id, specialty, status, submitted_at')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [user]);

  const getFormConfig = (specialty: string) => {
    return coachForms.find(f => f.specialty === specialty);
  };

  const getSubmissionForSpecialty = (specialty: string) => {
    return submissions.find(s => s.specialty === specialty);
  };

  return (
    <>
      <Helmet>
        <title>Client Portal | VitalityX Health</title>
        <meta name="description" content="Access your VitalityX client portal to manage your health journey" />
      </Helmet>

      <main className="min-h-screen">
        <Navbar />
        
        {/* Header */}
        <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="text-secondary font-semibold tracking-widest text-sm uppercase mb-2 block">
                  Welcome Back
                </span>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Client Portal
                </h1>
                <p className="text-muted-foreground mt-2">
                  {user?.email}
                </p>
              </motion.div>

              <div className="flex gap-3">
                {role === 'admin' && (
                  <Button variant="outline" asChild>
                    <Link to="/portal/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </Button>
                )}
                {isStaff && (
                  <Button variant="outline" asChild>
                    <Link to="/portal/manage">
                      Manage Submissions
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Intake Forms Grid */}
        <section className="pb-16 lg:pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-2">Coach Intake Forms</h2>
              <p className="text-muted-foreground">
                Complete intake forms to get started with our specialty coaches
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {coachForms.map((form, index) => {
                const submission = getSubmissionForSpecialty(form.specialty);
                const Icon = form.icon;
                const status = submission ? statusConfig[submission.status] : null;
                const StatusIcon = status?.icon;

                return (
                  <motion.div
                    key={form.specialty}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-card rounded-2xl p-6 hover:border-secondary/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold">{form.title.replace(' Intake', '')}</h3>
                            <p className="text-sm text-secondary">{form.tagline}</p>
                          </div>
                          {status && (
                            <Badge className={`${status.color} whitespace-nowrap`}>
                              {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                              {status.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {form.description}
                        </p>
                        
                        <div className="mt-4">
                          {submission ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                              </span>
                              {submission.status === 'pending' && (
                                <Button variant="link" size="sm" asChild className="text-secondary">
                                  <Link to={`/intake/${form.specialty}`}>
                                    Update Form
                                  </Link>
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button variant="heroOutline" size="sm" asChild className="group">
                              <Link to={`/intake/${form.specialty}`}>
                                Start Form
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="pb-16 lg:pb-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="glass-card rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Your Health Architect is here to guide you through the process
              </p>
              <Button variant="hero" asChild>
                <Link to="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Portal;
