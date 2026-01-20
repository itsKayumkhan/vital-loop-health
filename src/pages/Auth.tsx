import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { z } from 'zod';

const signUpSchema = z.object({
    fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Please enter a valid email address').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

const signInSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address').max(255),
    password: z.string().min(1, 'Password is required').max(100),
});

const getFriendlyErrorMessage = (error: any) => {
    const message = error.message.toLowerCase();

    if (message.includes('user already registered') || message.includes('already exists')) {
        return 'An account with this email already exists. Try signing in instead.';
    }
    if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
        return 'Invalid email or password. Please check your details and try again.';
    }
    if (message.includes('email not confirmed')) {
        return 'Please confirm your email address before signing in.';
    }
    if (message.includes('rate limit')) {
        return 'Too many attempts. Please try again later.';
    }
    if (message.includes('network error')) {
        return 'Connection error. Please check your internet and try again.';
    }

    return error.message;
};

const Auth = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { signIn, signUp, user, role, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: string })?.from;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Redirect based on role after login
    useEffect(() => {
        if (user && !authLoading) {
            const effectiveRole = role || 'client';
            if (from) {
                navigate(from, { replace: true });
                return;
            }
            const roleRedirects: Record<string, string> = {
                admin: '/crm',
                health_architect: '/crm',
                coach: '/crm',
                client: '/portal',
            };
            const destination = roleRedirects[effectiveRole] || '/portal';
            navigate(destination, { replace: true });
        }
    }, [user, role, authLoading, navigate, from]);

    const validate = () => {
        setErrors({});
        try {
            if (isSignUp) {
                signUpSchema.parse({ fullName, email, password });
            } else {
                signInSchema.parse({ email, password });
            }
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                err.errors.forEach(e => {
                    if (e.path[0]) {
                        newErrors[e.path[0] as string] = e.message;
                    }
                });
                setErrors(newErrors);

                // Also show a toast for the first validation error for better visibility
                if (err.errors[0]) {
                    toast({
                        title: 'Validation Error',
                        description: err.errors[0].message,
                        variant: 'destructive',
                    });
                }
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await signUp(email.trim(), password, fullName.trim());
                if (error) {
                    toast({
                        title: 'Sign up failed',
                        description: getFriendlyErrorMessage(error),
                        variant: 'destructive',
                    });
                } else if (data?.user && !data?.session) {
                    toast({
                        title: 'Confirmation required',
                        description: 'Please check your email to confirm your account.',
                    });
                } else {
                    toast({
                        title: 'Account created!',
                        description: 'You are now signed in to VitalityX.',
                    });
                }
            } else {
                const { error } = await signIn(email.trim(), password);
                if (error) {
                    toast({
                        title: 'Sign in failed',
                        description: getFriendlyErrorMessage(error),
                        variant: 'destructive',
                    });
                }
            }
        } catch (err: any) {
            toast({
                title: 'Unexpected error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>{isSignUp ? 'Create Account' : 'Sign In'} | VitalityX Health</title>
                <meta name="description" content="Access your VitalityX client portal" />
            </Helmet>

            <main className="min-h-screen">
                <Navbar />

                <section className="pt-32 pb-16 lg:pt-40 lg:pb-24">
                    <div className="container mx-auto px-4 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-md mx-auto"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                    {isSignUp ? 'Create Your Account' : 'Welcome Back'}
                                </h1>
                                <p className="text-muted-foreground">
                                    {isSignUp
                                        ? 'Join VitalityX to access your personalized health journey'
                                        : 'Sign in to access your client portal'
                                    }
                                </p>
                            </div>

                            <div className="glass-card rounded-2xl p-8">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {isSignUp && (
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <Input
                                                id="fullName"
                                                type="text"
                                                placeholder="John Doe"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="bg-muted/50"
                                                disabled={loading}
                                            />
                                            {errors.fullName && (
                                                <p className="text-sm text-destructive">{errors.fullName}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="bg-muted/50"
                                            disabled={loading}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-destructive">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-muted/50 pr-10"
                                                disabled={loading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-destructive">{errors.password}</p>
                                        )}
                                        {isSignUp && (
                                            <p className="text-xs text-muted-foreground">
                                                Must be at least 8 characters
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="hero"
                                        size="lg"
                                        className="w-full group"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {isSignUp ? 'Create Account' : 'Sign In'}
                                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsSignUp(!isSignUp);
                                            setErrors({});
                                        }}
                                        className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                                    >
                                        {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default Auth;
