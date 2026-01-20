import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ShopifyProduct, createStorefrontCheckout } from '@/lib/shopify';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CartItem {
    product: ShopifyProduct;
    variantId: string;
    variantTitle: string;
    price: {
        amount: string;
        currencyCode: string;
    };
    quantity: number;
    selectedOptions: Array<{
        name: string;
        value: string;
    }>;
    sellingPlanId?: string;
    sellingPlanName?: string;
}

interface CartStore {
    items: CartItem[];
    isLoading: boolean;
    checkoutUrl: string | null;

    // Actions
    addItem: (item: CartItem) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    removeItem: (variantId: string) => void;
    clearCart: () => void;
    setLoading: (loading: boolean) => void;
    createCheckout: () => Promise<string | null>;
    submitOrder: (userId: string) => Promise<{ url?: string; orderId?: string } | null>;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isLoading: false,
            checkoutUrl: null,

            addItem: (item) => {
                const { items } = get();
                // Items with different selling plans should be separate cart entries
                const existingItem = items.find(i =>
                    i.variantId === item.variantId &&
                    i.sellingPlanId === item.sellingPlanId
                );

                if (existingItem) {
                    set({
                        items: items.map(i =>
                            (i.variantId === item.variantId && i.sellingPlanId === item.sellingPlanId)
                                ? { ...i, quantity: i.quantity + item.quantity }
                                : i
                        )
                    });
                } else {
                    set({ items: [...items, item] });
                }
            },

            updateQuantity: (variantId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(variantId);
                    return;
                }

                set({
                    items: get().items.map(item =>
                        item.variantId === variantId ? { ...item, quantity } : item
                    )
                });
            },

            removeItem: (variantId) => {
                set({
                    items: get().items.filter(item => item.variantId !== variantId)
                });
            },

            clearCart: () => {
                set({ items: [], checkoutUrl: null });
            },

            setLoading: (isLoading) => set({ isLoading }),

            createCheckout: async () => {
                // Legacy Storefront API simulation - basically a no-op or redirect
                console.warn('createCheckout is deprecated. Use submitOrder.');
                return '#';
            },

            submitOrder: async (userId: string) => {
                const { items, getTotalPrice, setLoading } = get();
                if (items.length === 0) return null;

                setLoading(true);
                try {
                    const totalAmount = getTotalPrice();

                    // 0. Ensure Session
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error('You must be logged in to checkout');

                    // 1. Create Order (Pending)
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .insert({
                            customer_id: userId,
                            total_amount: totalAmount,
                            status: 'Pending',
                            currency: 'USD'
                        })
                        .select()
                        .single();

                    if (orderError) throw orderError;
                    const orderId = orderData.id;

                    // 2. Create Order Items
                    // User confirmed item.product.node.id is already the Supabase UUID
                    const orderItems = items.map(item => ({
                        order_id: orderId,
                        product_id: item.product.node.id,
                        quantity: item.quantity,
                        unit_price: parseFloat(item.price.amount),
                        title: item.product.node.title,
                        metadata: {
                            variant_id: item.variantId,
                            variant_title: item.variantTitle,
                            options: item.selectedOptions
                        }
                    }));

                    const { error: itemsError } = await supabase
                        .from('order_items')
                        .insert(orderItems);

                    if (itemsError) throw itemsError;

                    // 3. Create Stripe Checkout Session
                    const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
                        body: {
                            items: items,
                            userId: userId,
                            orderId: orderId, // Pass the DB Order ID linkage
                            returnUrl: window.location.origin
                        }
                    });

                    if (checkoutError) {
                        console.error('Stripe Checkout Error:', checkoutError);
                        throw new Error('Failed to Initialize Payment');
                    }

                    if (!checkoutData?.url) throw new Error('No checkout URL returned from payment provider');

                    return { url: checkoutData.url, orderId };

                } catch (error: any) {
                    console.error('Order submission failed:', error);
                    toast.error(error.message || 'Failed to place order');
                    return null;
                } finally {
                    setLoading(false);
                }
            },

            getTotalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            getTotalPrice: () => {
                return get().items.reduce(
                    (sum, item) => sum + parseFloat(item.price.amount) * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'vitalityx-cart',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
