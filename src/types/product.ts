
export interface Product {
    id: string;
    shopify_product_id: string | null;
    title: string;
    handle: string;
    description: string | null;
    product_type: string | null;
    tags: string[] | null;
    price: number | null;
    currency: string | null;
    variants_count: number | null;
    images_count: number | null;
    image_urls: string[] | null;
    stock_quantity: number;
    low_stock_threshold: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface InventoryLog {
    id: string;
    product_id: string;
    change_amount: number;
    current_stock: number;
    reason: string;
    created_by: string | null;
    created_at: string;

    // Joins if we want to display who did it
    created_by_user?: {
        full_name: string | null;
        email: string | null;
    };
}
