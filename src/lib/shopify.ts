import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SellingPlan {
    id: string;
    name: string;
    description: string | null;
    priceAdjustments: Array<{
        adjustmentValue: {
            adjustmentPercentage?: number;
            adjustmentAmount?: {
                amount: string;
                currencyCode: string;
            };
        };
    }>;
    deliveryPolicy: {
        interval: string;
        intervalCount: number;
    };
}

export interface SellingPlanGroup {
    name: string;
    sellingPlans: {
        edges: Array<{
            node: SellingPlan;
        }>;
    };
}

// Keeping the Shopify structure for compatibility with existing UI components
export interface ShopifyProduct {
    node: {
        id: string;
        title: string;
        description: string;
        handle: string;
        priceRange: {
            minVariantPrice: {
                amount: string;
                currencyCode: string;
            };
        };
        images: {
            edges: Array<{
                node: {
                    url: string;
                    altText: string | null;
                };
            }>;
        };
        variants: {
            edges: Array<{
                node: {
                    id: string;
                    title: string;
                    price: {
                        amount: string;
                        currencyCode: string;
                    };
                    availableForSale: boolean;
                    quantityAvailable?: number;
                    selectedOptions: Array<{
                        name: string;
                        value: string;
                    }>;
                };
            }>;
        };
        options: Array<{
            name: string;
            values: string[];
        }>;
        tags: string[];
        productType: string;
        sellingPlanGroups?: {
            edges: Array<{
                node: SellingPlanGroup;
            }>;
        };
        totalInventory?: number;
        lowStockThreshold?: number;
    };
}

// Database Row Type
interface DBProduct {
    id: string;
    shopify_product_id: string;
    title: string;
    handle: string;
    description: string;
    product_type: string;
    tags: string[];
    price: number;
    currency: string;
    variants_count: number;
    images_count: number;
    image_urls: string[];
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
}

// Mapper function: DB Row -> Shopify Interface
const mapDBProductToShopify = (product: DBProduct): ShopifyProduct['node'] => {
    const isActive = product.is_active !== false; // Default true if undefined
    const isAvailable = isActive && product.stock_quantity > 0;

    return {
        id: product.id,
        title: product.title,
        description: product.description || '',
        handle: product.handle,
        productType: product.product_type,
        tags: product.tags || [],
        priceRange: {
            minVariantPrice: {
                amount: product.price?.toString() || '0',
                currencyCode: product.currency || 'USD',
            },
        },
        images: {
            edges: (product.image_urls || []).map((url) => ({
                node: {
                    url: url,
                    altText: product.title,
                },
            })),
        },
        variants: {
            edges: [
                {
                    node: {
                        id: product.id,
                        title: 'Default Title',
                        price: {
                            amount: product.price?.toString() || '0',
                            currencyCode: product.currency || 'USD',
                        },
                        availableForSale: isAvailable,
                        quantityAvailable: product.stock_quantity,
                        selectedOptions: [
                            {
                                name: 'Title',
                                value: 'Default Title',
                            },
                        ],
                    },
                },
            ],
        },
        options: [
            {
                name: 'Title',
                values: ['Default Title'],
            },
        ],
        totalInventory: product.stock_quantity,
        lowStockThreshold: product.low_stock_threshold || 5
    };
};

// Fetch all products
export async function fetchProducts(first: number = 50, query?: string): Promise<ShopifyProduct[]> {
    let dbQuery = supabase.from('products').select('*').limit(first);

    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    const { data, error } = await dbQuery;

    if (error) {
        console.error('Error fetching products from key Supabase:', error);
        toast.error('Failed to load products');
        return [];
    }

    return (data as DBProduct[]).map((p) => ({ node: mapDBProductToShopify(p) }));
}

// Fetch product by handle
export async function fetchProductByHandle(handle: string): Promise<ShopifyProduct['node'] | null> {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('handle', handle)
        .single();

    if (error) {
        console.error('Error fetching product by handle:', error);
        return null;
    }

    if (!data) return null;

    return mapDBProductToShopify(data as DBProduct);
}

// Mock Create checkout - Shopify checkout is no longer available via API in this context
export async function createStorefrontCheckout(
    items: Array<{ variantId: string; quantity: number; sellingPlanId?: string }>
): Promise<string> {
    console.warn('createStorefrontCheckout called but Shopify API is removed.');
    toast.info('Checkout is currently disabled in this demo version.');
    return '#';
}
