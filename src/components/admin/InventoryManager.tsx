
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Plus, Minus, Edit, Trash2, Archive, AlertTriangle, Package, History } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from './ProductForm';
import { ScrollArea } from '@/components/ui/scroll-area';

export const InventoryManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch initial data
    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('title', { ascending: true });

        if (error) {
            toast.error('Failed to fetch products');
            console.error(error);
        } else {
            setProducts(data as Product[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();

        // Realtime subscription
        const channel = supabase
            .channel('products-inventory')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setProducts((prev) => [...prev, payload.new as Product]);
                    } else if (payload.eventType === 'UPDATE') {
                        setProducts((prev) =>
                            prev.map((p) => (p.id === payload.new.id ? (payload.new as Product) : p))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleStockChange = async (product: Product, amount: number) => {
        // Optimistic UI Update: Update local state immediately
        const oldStock = product.stock_quantity;
        setProducts(prev => prev.map(p =>
            p.id === product.id
                ? { ...p, stock_quantity: Math.max(0, p.stock_quantity + amount) }
                : p
        ));

        try {
            const { error } = await supabase.rpc('manage_inventory', {
                p_product_id: product.id,
                p_change_amount: amount,
                p_reason: amount > 0 ? 'manual_restock' : 'manual_correction',
            });

            if (error) throw error;
            toast.success('Stock updated');
        } catch (error: any) {
            // Revert on error
            setProducts(prev => prev.map(p =>
                p.id === product.id
                    ? { ...p, stock_quantity: oldStock }
                    : p
            ));
            toast.error(error.message || 'Failed to update stock');
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            toast.error('Failed to delete product');
        } else {
            toast.success('Product deleted');
        }
    };

    const toggleStatus = async (product: Product) => {
        const { error } = await supabase
            .from('products')
            .update({ is_active: !product.is_active })
            .eq('id', product.id);

        if (error) {
            toast.error('Failed to update status');
        } else {
            toast.success('Status updated');
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6" />
                        Inventory Management
                    </h2>
                    <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }} className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm w-full"
                    />
                </div>
            </div>

            <div className="border rounded-lg overflow-x-auto bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock Level</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading inventory...
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => {
                                const isLowStock = product.stock_quantity <= product.low_stock_threshold;
                                const isOutOfStock = product.stock_quantity === 0;

                                return (
                                    <TableRow key={product.id} className={isOutOfStock ? 'bg-destructive/10' : ''}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.image_urls?.[0] && (
                                                    <img
                                                        src={product.image_urls[0]}
                                                        alt={product.title}
                                                        className="w-10 h-10 rounded object-cover bg-muted"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium">{product.title}</p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {product.handle}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={product.is_active ? 'default' : 'secondary'}
                                                className="cursor-pointer"
                                                onClick={() => toggleStatus(product)}
                                            >
                                                {product.is_active ? 'Active' : 'Draft'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            ${product.price}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-lg font-bold ${isLowStock ? 'text-destructive' : ''}`}>
                                                        {product.stock_quantity}
                                                    </span>
                                                    {isLowStock && (
                                                        <Badge variant="destructive" className="text-[10px] h-4 px-1">
                                                            Low Stock
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleStockChange(product, -1)}
                                                        disabled={product.stock_quantity <= 0}
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleStockChange(product, 1)}
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(product); setIsFormOpen(true); }}>
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Edit Product</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => deleteProduct(product.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            Manage product details, pricing, and inventory settings.
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm
                        product={selectedProduct}
                        onSuccess={() => setIsFormOpen(false)}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
};
