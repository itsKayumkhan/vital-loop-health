
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/context/UserContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Package, ShoppingBag, Calendar } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    title: string;
    metadata: any;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    currency: string;
    order_items: OrderItem[];
    billing_address?: any;
    shipping_address?: any;
}

export default function Orders() {
    const { user } = useAuth();
    const { orders, loading, refreshData } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const clearCart = useCartStore(state => state.clearCart);

    // Handle Payment Return
    // Handle Payment Return
    const isVerifying = useRef(false);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const orderId = searchParams.get('order_id');

        // Only verify if we have parameters and haven't started verification yet
        if (sessionId && !isVerifying.current) {
            isVerifying.current = true;

            const verifyPayment = async () => {
                const toastId = toast.loading('Verifying payment...');
                try {
                    const { data, error } = await supabase.functions.invoke('verify-payment', {
                        body: { session_id: sessionId, order_id: orderId }
                    });

                    if (error) {
                        console.error('Verify payment invoke error:', error);
                        throw error;
                    }

                    if (data?.success) {
                        toast.success('Payment successful!', { id: toastId });
                        clearCart();
                        // Wait for data refresh to ensure UI is up to date
                        await refreshData();
                    } else {
                        console.warn('Verify payment failed logic:', data);
                        toast.error(data?.message || 'Payment verification failed check your bank', { id: toastId });
                    }
                } catch (error) {
                    console.error('Payment verification error:', error);
                    toast.error('Payment verification encountered an error', { id: toastId });
                } finally {
                    // Always clear the params to prevent infinite loop on refresh or re-render
                    setSearchParams(params => {
                        const newParams = new URLSearchParams(params);
                        newParams.delete('session_id');
                        newParams.delete('order_id');
                        return newParams;
                    }, { replace: true });

                    // Small delay before allowing another verification attempt (though params are gone)
                    setTimeout(() => {
                        isVerifying.current = false;
                    }, 1000);
                }
            };

            verifyPayment();
        }
    }, [searchParams, setSearchParams, clearCart, refreshData]);


    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 container py-24 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container py-24 px-4 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                    <p className="text-muted-foreground mb-8">View your order history and status.</p>

                    {orders.length === 0 ? (
                        <div className="text-center py-20 border rounded-lg bg-muted/10">
                            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                            <p className="text-muted-foreground mb-6">Looks like you haven't bought anything yet.</p>
                            <Button asChild>
                                <Link to="/supplements">Browse Store</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="overflow-hidden">
                                    <CardHeader className="bg-muted/30 pb-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    Order #{order.id.slice(0, 8)}
                                                    <Badge variant="outline" className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                                </CardDescription>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-xl">${Number(order.total_amount).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">{order.order_items.length} items</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Accordion type="single" collapsible>
                                            <AccordionItem value="details" className="border-0">
                                                <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-muted/20 text-sm md:text-base">
                                                    View Order Details
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="px-6 pb-6 space-y-4">
                                                        <div className="border-t my-2"></div>
                                                        {order.order_items.map((item) => (
                                                            <div key={item.id} className="flex justify-between items-center py-2">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                                                                        <Package className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{item.title || 'Unknown Product'}</p>
                                                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="font-medium">
                                                                    ${(item.unit_price * item.quantity).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        ))}

                                                        {order.billing_address && (
                                                            <div className="grid grid-cols-2 gap-4 py-4 text-sm border-t">
                                                                <div>
                                                                    <p className="font-semibold mb-1">Billing Address</p>
                                                                    <p className="text-muted-foreground">{order.billing_address.line1}</p>
                                                                    {order.billing_address.line2 && <p className="text-muted-foreground">{order.billing_address.line2}</p>}
                                                                    <p className="text-muted-foreground">{order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}</p>
                                                                    <p className="text-muted-foreground">{order.billing_address.country}</p>
                                                                </div>
                                                                {order.shipping_address && (
                                                                    <div className="text-right">
                                                                        <p className="font-semibold mb-1">Shipping Address</p>
                                                                        <p className="text-muted-foreground">{order.shipping_address.line1}</p>
                                                                        {order.shipping_address.line2 && <p className="text-muted-foreground">{order.shipping_address.line2}</p>}
                                                                        <p className="text-muted-foreground">{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                                                                        <p className="text-muted-foreground">{order.shipping_address.country}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="border-t pt-4 mt-4 flex justify-between font-bold">
                                                            <span>Total</span>
                                                            <span>${Number(order.total_amount).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
