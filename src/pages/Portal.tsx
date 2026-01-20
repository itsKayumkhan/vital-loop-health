import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    Crown,
    ShoppingCart,
    Users,
    FileText,
    Calendar,
    FolderOpen,
    ArrowRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    User,
    LogOut,
    Mail,
    Phone,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { coachForms } from '@/data/coachForms';
import { ProgramAssessmentsTab } from '@/components/portal/ProgramAssessmentsTab';

// Types
interface Membership {
    id: string;
    tier: 'free' | 'essential' | 'premium' | 'elite';
    status: 'active' | 'paused' | 'cancelled' | 'expired';
    start_date: string;
    renewal_date: string | null;
    monthly_price: number | null;
}

interface Purchase {
    id: string;
    product_name: string;
    amount: number;
    currency: string;
    status: string;
    purchased_at: string;
    purchase_type: string;
}

interface FormSubmission {
    id: string;
    specialty: string;
    status: string;
    submitted_at: string;
}

interface Document {
    id: string;
    name: string;
    document_type: string;
    file_path: string;
    created_at: string;
}

// Status configs
const membershipTierConfig: Record<string, { label: string; color: string; icon: string }> = {
    free: { label: 'Free', color: 'bg-gray-500/20 text-gray-500', icon: '🌱' },
    essential: { label: 'Essential', color: 'bg-blue-500/20 text-blue-500', icon: '⭐' },
    premium: { label: 'Premium', color: 'bg-purple-500/20 text-purple-500', icon: '💎' },
    elite: { label: 'Elite', color: 'bg-secondary/20 text-secondary', icon: '👑' },
};

const membershipStatusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-green-500/20 text-green-500' },
    paused: { label: 'Paused', color: 'bg-yellow-500/20 text-yellow-500' },
    cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-500' },
    expired: { label: 'Expired', color: 'bg-gray-500/20 text-gray-500' },
};

const formStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending Review', color: 'bg-yellow-500/20 text-yellow-500', icon: Clock },
    in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-500', icon: AlertCircle },
    assigned: { label: 'Coach Assigned', color: 'bg-purple-500/20 text-purple-500', icon: User },
    completed: { label: 'Completed', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 },
    archived: { label: 'Archived', color: 'bg-gray-500/20 text-gray-500', icon: FileText },
};

const Portal = () => {
    const { user, signOut } = useAuth();
    const {
        profile,
        membership,
        purchases,
        submissions,
        documents,
        orders,
        assignedCoaches,
        loading
    } = useUser();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const getFormConfig = (specialty: string) => coachForms.find(f => f.specialty === specialty);
    const getSubmissionForSpecialty = (specialty: string) => submissions.find(s => s.specialty === specialty);

    return (
        <>
            <Helmet>
                <title>My Portal | VitalityX Health</title>
                <meta name="description" content="Access your VitalityX portal to view your membership, purchases, and health journey" />
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
                                    {profile?.full_name || 'My Portal'}
                                </h1>
                                <p className="text-muted-foreground mt-2">{user?.email}</p>
                            </motion.div>

                            <Button variant="outline" onClick={signOut}>
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <section className="pb-16 lg:pb-24">
                    <div className="container mx-auto px-4 lg:px-8">
                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading your portal...</div>
                        ) : (
                            <Tabs defaultValue="overview" className="space-y-8">
                                <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-2">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="programs">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Programs
                                    </TabsTrigger>
                                    <TabsTrigger value="membership">Membership</TabsTrigger>
                                    <TabsTrigger value="purchases">Purchases</TabsTrigger>
                                    <TabsTrigger value="coaches">My Coaches</TabsTrigger>
                                    <TabsTrigger value="forms">Intake Forms</TabsTrigger>
                                    <TabsTrigger value="documents">Documents</TabsTrigger>
                                </TabsList>

                                {/* Programs Tab */}
                                <TabsContent value="programs">
                                    <ProgramAssessmentsTab />
                                </TabsContent>

                                {/* Overview Tab */}
                                <TabsContent value="overview" className="space-y-6">
                                    {/* Pending Forms Banner */}
                                    {submissions.filter(s => s.status === 'pending').length > 0 && (
                                        <Card className="border-secondary/50 bg-secondary/5">
                                            <CardContent className="py-4">
                                                <div className="flex items-center justify-between gap-4 flex-wrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-secondary" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">You have {submissions.filter(s => s.status === 'pending').length} intake form(s) to complete</p>
                                                            <p className="text-sm text-muted-foreground">Complete your forms to help your coach personalize your program</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="hero" size="sm" asChild>
                                                        <Link to="#" onClick={() => document.querySelector('[value="forms"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                                                            Complete Forms
                                                            <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Membership Card */}
                                        <Card className="glass-card">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-lg font-medium">Membership</CardTitle>
                                                <Crown className="h-5 w-5 text-secondary" />
                                            </CardHeader>
                                            <CardContent>
                                                {membership ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-2xl">{membershipTierConfig[membership.tier]?.icon}</span>
                                                            <Badge className={membershipTierConfig[membership.tier]?.color}>
                                                                {membershipTierConfig[membership.tier]?.label}
                                                            </Badge>
                                                            <Badge className={membershipStatusConfig[membership.status]?.color}>
                                                                {membershipStatusConfig[membership.status]?.label}
                                                            </Badge>
                                                        </div>
                                                        {membership.renewal_date && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Renews: {new Date(membership.renewal_date).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">No active membership</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Coaches Card */}
                                        <Card className="glass-card">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-lg font-medium">Assigned Coaches</CardTitle>
                                                <Users className="h-5 w-5 text-secondary" />
                                            </CardHeader>
                                            <CardContent>
                                                {assignedCoaches.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {assignedCoaches.map((coach, i) => {
                                                            const config = getFormConfig(coach.specialty);
                                                            return (
                                                                <Badge key={i} variant="outline">
                                                                    {config?.title.replace(' Intake', '') || coach.specialty}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">No coaches assigned yet</p>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Recent Activity Card */}
                                        <Card className="glass-card">
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-lg font-medium">Recent Purchases</CardTitle>
                                                <ShoppingCart className="h-5 w-5 text-secondary" />
                                            </CardHeader>
                                            <CardContent>
                                                {purchases.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {purchases.slice(0, 3).map((purchase) => (
                                                            <div key={purchase.id} className="text-sm">
                                                                <p className="font-medium truncate">{purchase.product_name}</p>
                                                                <p className="text-muted-foreground">
                                                                    ${purchase.amount} • {new Date(purchase.purchased_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-muted-foreground">No purchases yet</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Quick Actions */}
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle>Quick Actions</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-wrap gap-4">
                                            <Button variant="heroOutline" asChild>
                                                <Link to="/contact">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Contact Support
                                                </Link>
                                            </Button>
                                            <Button variant="heroOutline" asChild>
                                                <Link to="/supplements">
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Shop Supplements
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Membership Tab */}
                                <TabsContent value="membership">
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Crown className="h-5 w-5 text-secondary" />
                                                Your Membership
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {membership ? (
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-4xl">{membershipTierConfig[membership.tier]?.icon}</span>
                                                        <div>
                                                            <h3 className="text-2xl font-bold">{membershipTierConfig[membership.tier]?.label} Plan</h3>
                                                            <Badge className={membershipStatusConfig[membership.status]?.color}>
                                                                {membershipStatusConfig[membership.status]?.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="grid md:grid-cols-3 gap-4">
                                                        <div className="glass-card rounded-lg p-4">
                                                            <p className="text-sm text-muted-foreground">Started</p>
                                                            <p className="font-semibold">{new Date(membership.start_date).toLocaleDateString()}</p>
                                                        </div>
                                                        {membership.renewal_date && (
                                                            <div className="glass-card rounded-lg p-4">
                                                                <p className="text-sm text-muted-foreground">Next Renewal</p>
                                                                <p className="font-semibold">{new Date(membership.renewal_date).toLocaleDateString()}</p>
                                                            </div>
                                                        )}
                                                        {membership.monthly_price && (
                                                            <div className="glass-card rounded-lg p-4">
                                                                <p className="text-sm text-muted-foreground">Monthly Rate</p>
                                                                <p className="font-semibold">${membership.monthly_price}/mo</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground mb-4">You don't have an active membership</p>
                                                    <Button variant="hero" asChild>
                                                        <Link to="/programs">
                                                            View Programs
                                                            <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Purchases Tab */}
                                <TabsContent value="purchases">
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <ShoppingCart className="h-5 w-5 text-secondary" />
                                                Purchase History
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {/* Show Orders from Store */}
                                            {orders.length > 0 && (
                                                <div className="space-y-6 mb-8">
                                                    <h3 className="text-lg font-semibold">Store Orders</h3>
                                                    <div className="space-y-4">
                                                        {orders.map((order) => (
                                                            <div key={order.id} className="glass-card rounded-lg p-4">
                                                                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                                    <div>
                                                                        <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {new Date(order.created_at).toLocaleDateString()} • {order.order_items.length} Items
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-bold text-lg">${Number(order.total_amount).toFixed(2)}</p>
                                                                        <Badge variant="outline" className={
                                                                            order.status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                                                order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                                                    'bg-muted text-muted-foreground'
                                                                        }>
                                                                            {order.status}
                                                                        </Badge>
                                                                    </div>
                                                                </div>

                                                                <div className="border-t pt-3 space-y-2">
                                                                    {order.order_items.map((item: any, idx: number) => (
                                                                        <div key={idx} className="flex justify-between text-sm">
                                                                            <span className="text-muted-foreground">{item.quantity}x {item.title}</span>
                                                                            <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {order.billing_address && (
                                                                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-xs">
                                                                        <div>
                                                                            <p className="font-semibold text-foreground mb-1">Billing</p>
                                                                            <p className="text-muted-foreground">{order.billing_address.line1}</p>
                                                                            {order.billing_address.line2 && <p className="text-muted-foreground">{order.billing_address.line2}</p>}
                                                                            <p className="text-muted-foreground">{order.billing_address.city}, {order.billing_address.state}</p>
                                                                            <p className="text-muted-foreground">{order.billing_address.postal_code}, {order.billing_address.country}</p>
                                                                        </div>
                                                                        {order.shipping_address && (
                                                                            <div className="text-right">
                                                                                <p className="font-semibold text-foreground mb-1">Shipping</p>
                                                                                <p className="text-muted-foreground">{order.shipping_address.line1}</p>
                                                                                {order.shipping_address.line2 && <p className="text-muted-foreground">{order.shipping_address.line2}</p>}
                                                                                <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state}</p>
                                                                                <p className="text-muted-foreground">{order.shipping_address.postal_code}, {order.shipping_address.country}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show CRM Purchases (Legacy/Services) */}
                                            {purchases.length > 0 && (
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-semibold">Other Purchases</h3>
                                                    <div className="space-y-4">
                                                        {purchases.map((purchase) => (
                                                            <div key={purchase.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                                                                <div>
                                                                    <p className="font-semibold">{purchase.product_name}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {new Date(purchase.purchased_at).toLocaleDateString()} • {purchase.purchase_type}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-lg">${purchase.amount}</p>
                                                                    <Badge variant="outline">{purchase.status}</Badge>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {orders.length === 0 && purchases.length === 0 && (
                                                <div className="text-center py-8">
                                                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground mb-4">No purchases yet</p>
                                                    <Button variant="hero" asChild>
                                                        <Link to="/supplements">
                                                            Shop Supplements
                                                            <ArrowRight className="ml-2 w-4 h-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Coaches Tab */}
                                <TabsContent value="coaches">
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-secondary" />
                                                Your Health Team
                                            </CardTitle>
                                            <CardDescription>
                                                Coaches assigned to support your health journey
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {assignedCoaches.length > 0 ? (
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {assignedCoaches.map((coach, i) => {
                                                        const config = getFormConfig(coach.specialty);
                                                        const Icon = config?.icon;
                                                        return (
                                                            <div key={i} className="glass-card rounded-xl p-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config?.gradient} flex items-center justify-center`}>
                                                                        {Icon && <Icon className="w-7 h-7 text-white" />}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold">{config?.title.replace(' Intake', ' Coach')}</h3>
                                                                        <p className="text-sm text-muted-foreground">{config?.tagline}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground mb-4">Complete an intake form to get matched with a coach</p>
                                                    <Button variant="hero" asChild>
                                                        <a href="#forms">
                                                            Start Intake Form
                                                            <ArrowRight className="ml-2 w-4 h-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Intake Forms Tab */}
                                <TabsContent value="forms">
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-secondary" />
                                                Coach Intake Forms
                                            </CardTitle>
                                            <CardDescription>
                                                Complete intake forms to help your coach personalize your program
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Pending Forms Section */}
                                            {submissions.filter(s => s.status === 'pending').length > 0 && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-secondary flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Action Required - Complete These Forms
                                                    </h3>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        {submissions.filter(s => s.status === 'pending').map((submission) => {
                                                            const form = getFormConfig(submission.specialty);
                                                            if (!form) return null;
                                                            const Icon = form.icon;
                                                            return (
                                                                <div
                                                                    key={submission.id}
                                                                    className="glass-card rounded-xl p-5 border-secondary/30 bg-secondary/5 hover:border-secondary/50 transition-all duration-300"
                                                                >
                                                                    <div className="flex items-start gap-4">
                                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center flex-shrink-0`}>
                                                                            <Icon className="w-6 h-6 text-white" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <h3 className="font-bold">{form.title.replace(' Intake', '')}</h3>
                                                                                <Badge className="bg-yellow-500/20 text-yellow-600">
                                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                                    Pending
                                                                                </Badge>
                                                                            </div>
                                                                            <p className="text-sm text-muted-foreground mt-1">{form.tagline}</p>
                                                                            <div className="mt-4">
                                                                                <Button variant="hero" size="sm" asChild className="w-full">
                                                                                    <Link to={`/intake/${form.specialty}`}>
                                                                                        Complete Form
                                                                                        <ArrowRight className="ml-2 w-4 h-4" />
                                                                                    </Link>
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* All Forms */}
                                            <div className="space-y-3">
                                                {submissions.filter(s => s.status === 'pending').length > 0 && (
                                                    <h3 className="text-sm font-medium text-muted-foreground">All Forms</h3>
                                                )}
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {coachForms.map((form) => {
                                                        const submission = getSubmissionForSpecialty(form.specialty);
                                                        const Icon = form.icon;
                                                        const status = submission ? formStatusConfig[submission.status] : null;
                                                        const StatusIcon = status?.icon;
                                                        const isPending = submission?.status === 'pending';

                                                        return (
                                                            <div
                                                                key={form.specialty}
                                                                className={`glass-card rounded-xl p-5 hover:border-secondary/50 transition-all duration-300 ${isPending ? 'border-secondary/30 bg-secondary/5' : ''}`}
                                                            >
                                                                <div className="flex items-start gap-4">
                                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${form.gradient} flex items-center justify-center flex-shrink-0`}>
                                                                        <Icon className="w-6 h-6 text-white" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <h3 className="font-bold">{form.title.replace(' Intake', '')}</h3>
                                                                            {status && (
                                                                                <Badge className={status.color}>
                                                                                    {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                                                                                    {status.label}
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                            {form.description}
                                                                        </p>
                                                                        <div className="mt-4">
                                                                            {submission ? (
                                                                                <div className="flex items-center justify-between">
                                                                                    <span className="text-xs text-muted-foreground">
                                                                                        {isPending ? 'Assigned' : 'Submitted'} {new Date(submission.submitted_at).toLocaleDateString()}
                                                                                    </span>
                                                                                    {isPending && (
                                                                                        <Button variant="hero" size="sm" asChild>
                                                                                            <Link to={`/intake/${form.specialty}`}>Complete Form</Link>
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
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents">
                                    <Card className="glass-card">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <FolderOpen className="h-5 w-5 text-secondary" />
                                                Shared Documents
                                            </CardTitle>
                                            <CardDescription>
                                                Documents shared with you by your health team
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {documents.length > 0 ? (
                                                <div className="space-y-3">
                                                    {documents.map((doc) => (
                                                        <div key={doc.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                                                <div>
                                                                    <p className="font-medium">{doc.name}</p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <p className="text-muted-foreground">No documents shared yet</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                            </Tabs>
                        )}
                    </div>
                </section>

                <Footer />
            </main>
        </>
    );
};

export default Portal;
