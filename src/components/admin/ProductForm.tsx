
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';

interface ProductFormProps {
    product: Product | null;
    onSuccess: () => void;
    onCancel: () => void;
}

export const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>(product?.image_urls || []);
    const [currentImageUrl, setCurrentImageUrl] = useState('');

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Partial<Product>>({
        defaultValues: product || {
            is_active: true,
            stock_quantity: 0,
            low_stock_threshold: 5,
            variants_count: 1,
            images_count: 0
        }
    });

    useEffect(() => {
        if (product) {
            reset(product);
            setImageUrls(product.image_urls || []);
        } else {
            reset({
                is_active: true,
                stock_quantity: 0,
                low_stock_threshold: 5,
                currency: 'USD'
            });
            setImageUrls([]);
        }
    }, [product, reset]);

    const addImage = () => {
        if (currentImageUrl) {
            setImageUrls([...imageUrls, currentImageUrl]);
            setCurrentImageUrl('');
        }
    };

    const removeImage = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: Partial<Product>) => {
        setLoading(true);
        try {
            const payload = {
                ...data,
                image_urls: imageUrls,
                images_count: imageUrls.length,
                // Auto-generate handle if missing
                handle: data.handle || data.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
            };

            if (product?.id) {
                // Update
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', product.id);
                if (error) throw error;
                toast.success('Product updated');
            } else {
                // Create
                const { error } = await supabase
                    .from('products')
                    .insert([payload]);
                if (error) throw error;
                toast.success('Product created');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Product Title</Label>
                        <Input
                            id="title"
                            {...register('title', { required: 'Title is required' })}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="handle">Handle (Slug)</Label>
                        <Input
                            id="handle"
                            {...register('handle')}
                            placeholder="auto-generated-from-title"
                        />
                    </div>

                    <div>
                        <Label htmlFor="price">Price (USD)</Label>
                        <Input
                            id="price"
                            type="number"
                            step="0.01"
                            {...register('price', { required: 'Price is required', min: 0 })}
                        />
                    </div>

                    <div>
                        <Label htmlFor="product_type">Product Type</Label>
                        <Input
                            id="product_type"
                            {...register('product_type')}
                            placeholder="Supplement, Bundle, etc."
                        />
                    </div>
                </div>

                {/* Inventory Settings */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="stock_quantity">Stock Quantity</Label>
                            <Input
                                id="stock_quantity"
                                type="number"
                                {...register('stock_quantity', { required: true, min: 0 })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="low_stock_threshold">Low Stock Alert At</Label>
                            <Input
                                id="low_stock_threshold"
                                type="number"
                                {...register('low_stock_threshold', { required: true, min: 1 })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                        <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <p className="text-xs text-muted-foreground">Visible in store</p>
                        </div>
                        <Switch
                            checked={product?.is_active ?? true}
                            onCheckedChange={(checked) => setValue('is_active', checked)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Label>Description</Label>
                <Textarea
                    {...register('description')}
                    className="h-32"
                />
            </div>

            {/* Image Management */}
            <div className="space-y-2">
                <Label>Images</Label>
                <div className="flex gap-2">
                    <Input
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                        placeholder="Paste image URL..."
                    />
                    <Button type="button" onClick={addImage} variant="secondary">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {imageUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-2">
                        {imageUrls.map((url, idx) => (
                            <div key={idx} className="relative group aspect-square border rounded-lg overflow-hidden bg-muted">
                                <img src={url} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {product ? 'Update Product' : 'Create Product'}
                </Button>
            </div>
        </form>
    );
};
