import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, Loader2, Package, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchProductByHandle, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

type ShopifyImageNode = ShopifyProduct['node']['images']['edges'][number]['node'];

const normalizeShopifyImageUrl = (url: string) => {
  // Shopify images can be duplicated with only a "version" suffix change
  // (e.g. Bottle_02X1415.120_F-2.jpg vs Bottle_02X1415.120_F-3.jpg)
  // or with different query params (?v=...). Normalize to a stable key.
  try {
    const u = new URL(url);
    const filename = u.pathname.split('/').pop() ?? u.pathname;

    const cleanedFilename = filename
      .replace(/-\d+(?=\.[a-z0-9]+$)/i, '') // strip -2, -3, etc.
      .replace(/_\d+(?=\.[a-z0-9]+$)/i, ''); // strip _1, _2, etc.

    return cleanedFilename.toLowerCase();
  } catch {
    const withoutQuery = url.split('?')[0];
    const filename = withoutQuery.split('/').pop() ?? withoutQuery;
    return filename
      .replace(/-\d+(?=\.[a-z0-9]+$)/i, '')
      .replace(/_\d+(?=\.[a-z0-9]+$)/i, '')
      .toLowerCase();
  }
};

const getFilenameFromUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.pathname.split('/').pop() ?? u.pathname;
  } catch {
    return url.split('?')[0].split('/').pop() ?? url;
  }
};

const getImageKind = (image: ShopifyImageNode) => {
  const filename = getFilenameFromUrl(image.url).toLowerCase();
  const alt = (image.altText ?? '').toLowerCase();

  // Treat "facts" as its own kind (often duplicated as both a clean PNG and a photo)
  if (filename.includes('facts') || alt.includes('facts')) return 'facts';

  // Bottle view suffixes from your uploads (F/L/R/B)
  if (/_f[-_.]/.test(filename) || alt.includes('front')) return 'front';
  if (/_b[-_.]/.test(filename) || alt.includes('back')) return 'back';
  if (/_l[-_.]/.test(filename) || alt.includes('left')) return 'left';
  if (/_r[-_.]/.test(filename) || alt.includes('right')) return 'right';

  // Check for "-front", "-left", "-right", "-back" patterns in filename
  if (filename.includes('-front') || filename.includes('_front')) return 'front';
  if (filename.includes('-left') || filename.includes('_left')) return 'left';
  if (filename.includes('-right') || filename.includes('_right')) return 'right';
  if (filename.includes('-back') || filename.includes('_back')) return 'back';

  // Main product image (no suffix) - treat as "main" view
  return 'main';
};

const scoreImage = (kind: string, image: ShopifyImageNode) => {
  const filename = getFilenameFromUrl(image.url).toLowerCase();
  const ext = filename.split('.').pop() ?? '';
  const isBottle = filename.includes('bottle_');

  if (kind === 'facts') {
    // Prefer clean, readable facts images
    return (ext === 'png' ? 30 : 0) + (filename.includes('facts') ? 10 : 0);
  }

  if (kind === 'front' || kind === 'back' || kind === 'left' || kind === 'right') {
    // Prefer the Bottle_* images you uploaded over older generic product shots
    return (isBottle ? 20 : 0) + (ext === 'png' ? 5 : 0);
  }

  return 0;
};

const dedupeShopifyImages = (edges: ShopifyProduct['node']['images']['edges']): ShopifyImageNode[] => {
  const nodes = edges.map((e) => e.node);
  const candidates = nodes.map((node, index) => {
    const kind = getImageKind(node);
    return { node, index, kind, score: scoreImage(kind, node) };
  });

  const bestByKind = new Map<string, (typeof candidates)[number]>();
  for (const c of candidates) {
    const current = bestByKind.get(c.kind);
    if (!current || c.score > current.score) bestByKind.set(c.kind, c);
  }

  return candidates
    .filter((c) => bestByKind.get(c.kind)?.index === c.index)
    .sort((a, b) => a.index - b.index)
    .map((c) => c.node);
};

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProduct = async () => {
      if (!handle) return;
      try {
        const productData = await fetchProductByHandle(handle);
        setProduct(productData);
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product) return;
    const variant = product.variants.edges[0]?.node;
    if (!variant) return;

    addItem({
      product: { node: product },
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success(`${product.title} added to cart`, {
      position: 'top-center',
    });
  };

  // Lightbox navigation
  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const goToPrevImage = useCallback(() => {
    if (!product) return;
    const images = dedupeShopifyImages(product.images.edges);
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [product]);

  const goToNextImage = useCallback(() => {
    if (!product) return;
    const images = dedupeShopifyImages(product.images.edges);
    if (images.length === 0) return;
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [product]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'ArrowRight') goToNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrevImage, goToNextImage]);

  // Keep selected index in-bounds after deduping (or when product changes)
  useEffect(() => {
    if (!product) return;
    const uniqueCount = dedupeShopifyImages(product.images.edges).length;
    if (uniqueCount === 0) return;
    if (selectedImageIndex >= uniqueCount) setSelectedImageIndex(0);
  }, [product, selectedImageIndex]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
          <span className="ml-3 text-muted-foreground">Loading product...</span>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/supplements">Back to Supplements</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = dedupeShopifyImages(product.images.edges);
  const selectedImage = images[selectedImageIndex] || images[0];
  const variant = product.variants.edges[0]?.node;
  const price = variant?.price.amount || product.priceRange.minVariantPrice.amount;

  // Shopify CDN supports dynamic resizing via query params (helps prevent blurry upscales)
  // Request high-res images for crisp supplement facts text
  const withHighRes = (url: string, width: number) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}`;
  };

  const buildSrcSet = (url: string, widths: number[]) =>
    widths.map((w) => `${withHighRes(url, w)} ${w}w`).join(', ');

  // Use higher widths for crisp text rendering on supplement facts labels
  const MAIN_WIDTHS = [1024, 1600, 2048, 2400, 3000];
  const THUMB_WIDTHS = [200, 320, 480];

  return (
    <>
      <Helmet>
        <title>{product.title} | VitalityX</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <Link to="/supplements" className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Supplements
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {/* Main Image - Clickable for Lightbox */}
              <button
                onClick={() => openLightbox(selectedImageIndex)}
                className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-muted/50 to-muted/20 p-8 cursor-zoom-in group"
                aria-label="Click to zoom image"
              >
                {selectedImage && (
                  <img
                    src={withHighRes(selectedImage.url, 2400)}
                    srcSet={buildSrcSet(selectedImage.url, MAIN_WIDTHS)}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    alt={selectedImage.altText || product.title}
                    className="w-full h-full object-contain [image-rendering:_-webkit-optimize-contrast]"
                    loading="eager"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>
              </button>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.url}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-secondary ring-2 ring-secondary/30'
                          : 'border-border hover:border-secondary/50'
                      }`}
                    >
                      <img
                        src={withHighRes(image.url, 320)}
                        srcSet={buildSrcSet(image.url, THUMB_WIDTHS)}
                        sizes="80px"
                        alt={image.altText || `${product.title} - Image ${index + 1}`}
                        className="w-full h-full object-contain bg-muted/30 p-1"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <Badge variant="outline" className="w-fit mb-4 border-secondary/50 text-secondary">
                {product.productType}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>

              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-secondary">
                  ${parseFloat(price).toFixed(2)}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    className="px-4 py-2 hover:bg-muted transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    className="px-4 py-2 hover:bg-muted transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button 
                size="lg" 
                className="w-full bg-secondary hover:bg-secondary/90"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ${(parseFloat(price) * quantity).toFixed(2)}
              </Button>

              {/* Trust Badges */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl mb-1">🔬</div>
                    <p className="text-xs text-muted-foreground">Lab Tested</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">🌿</div>
                    <p className="text-xs text-muted-foreground">Premium Quality</p>
                  </div>
                  <div>
                    <div className="text-2xl mb-1">📦</div>
                    <p className="text-xs text-muted-foreground">Fast Shipping</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Main Image */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={withHighRes(selectedImage.url, 3000)}
                alt={selectedImage.altText || product.title}
                className="max-w-full max-h-[90vh] object-contain [image-rendering:_-webkit-optimize-contrast]"
              />
            </motion.div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-lg bg-black/50 backdrop-blur-sm">
                {images.map((image, index) => (
                  <button
                    key={image.url}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImageIndex(index);
                    }}
                    className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-secondary ring-2 ring-secondary/50'
                        : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <img
                      src={withHighRes(image.url, 160)}
                      alt={image.altText || `${product.title} - Image ${index + 1}`}
                      className="w-full h-full object-contain bg-white/10 p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white/80 text-sm font-medium">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default ProductDetail;
