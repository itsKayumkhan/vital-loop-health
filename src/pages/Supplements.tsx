import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, Package, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchProducts, ShopifyProduct } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

const Supplements = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [bundles, setBundles] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const allProducts = await fetchProducts(50);
        const bundleProducts = allProducts.filter(p => p.node.productType === 'Bundle');
        const supplementProducts = allProducts.filter(p => p.node.productType === 'Supplement');
        setBundles(bundleProducts);
        setProducts(supplementProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddToCart = (product: ShopifyProduct) => {
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;

    addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });

    toast.success(`${product.node.title} added to cart`, {
      position: 'top-center',
    });
  };

  const isBestValue = (product: ShopifyProduct) => {
    return product.node.tags.some(tag => tag.toLowerCase().includes('best value'));
  };

  return (
    <>
      <Helmet>
        <title>Precision Supplements | VitalityX</title>
        <meta name="description" content="Science-backed supplements formulated based on your unique genetic profile and biomarkers. Personalized nutrition for optimal health." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4 border-secondary/50 text-secondary">
              Precision Supplementation
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Supplements Designed for{' '}
              <span className="text-gradient">Your Biology</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Every formula is crafted using insights from your genetic data and biomarker analysis. 
              No guesswork — just science-backed supplementation tailored to your needs.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-secondary" />
              <span className="ml-3 text-muted-foreground">Loading products...</span>
            </div>
          ) : (
            <>
              {/* Bundles Section */}
              {bundles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-16"
                >
                  <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                    Value Bundles
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {bundles.map((product, index) => (
                      <motion.div
                        key={product.node.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="h-full glass-card border-secondary/30 hover:border-secondary/60 transition-all duration-300 relative overflow-hidden">
                          {isBestValue(product) && (
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-secondary text-secondary-foreground">Best Value</Badge>
                            </div>
                          )}
                          <div className="relative overflow-hidden h-96 bg-white rounded-t-lg">
                            {product.node.images.edges[0]?.node && (
                              <img 
                                src={product.node.images.edges[0].node.url} 
                                alt={product.node.images.edges[0].node.altText || product.node.title}
                                className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </div>
                          <CardHeader className="pt-4">
                            <CardTitle className="text-2xl">{product.node.title}</CardTitle>
                            <CardDescription className="text-base line-clamp-2">{product.node.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-baseline gap-3 mb-4">
                              <span className="text-3xl font-bold text-secondary">
                                ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.node.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </CardContent>
                          <CardFooter className="flex gap-2">
                            <Link to={`/product/${product.node.handle}`} className="flex-1">
                              <Button variant="outline" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                            </Link>
                            <Button 
                              className="flex-1 bg-secondary hover:bg-secondary/90"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Add to Cart
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Individual Supplements */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
                  Individual Supplements
                </h2>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No products found</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                      <motion.div
                        key={product.node.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <Card className="h-full glass-card hover:border-secondary/40 transition-all duration-300 group">
                          <CardHeader className="p-0">
                            <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-b from-muted/50 to-muted/20">
                              {product.node.images.edges[0]?.node && (
                                <img 
                                  src={product.node.images.edges[0].node.url} 
                                  alt={product.node.images.edges[0].node.altText || product.node.title}
                                  className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                              <Badge 
                                variant="outline" 
                                className="absolute top-3 right-3 text-xs bg-background/80 backdrop-blur-sm"
                              >
                                {product.node.tags[0] || product.node.productType}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <CardTitle className="text-lg mb-1">{product.node.title}</CardTitle>
                            <CardDescription className="text-sm line-clamp-2 mb-3">
                              {product.node.description}
                            </CardDescription>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {product.node.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs rounded-full bg-secondary/10 text-secondary border border-secondary/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <p className="text-xl font-bold text-secondary">
                              ${parseFloat(product.node.priceRange.minVariantPrice.amount).toFixed(2)}
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 flex gap-2">
                            <Link to={`/product/${product.node.handle}`} className="flex-1">
                              <Button variant="ghost" className="w-full" size="sm">
                                <Eye className="w-3.5 h-3.5 mr-2" />
                                Details
                              </Button>
                            </Link>
                            <Button 
                              className="flex-1 bg-secondary hover:bg-secondary/90" 
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 mr-2" />
                              Add to Cart
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-20 text-center glass-card rounded-3xl p-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Not Sure What You Need?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Start with a genetic panel or comprehensive biomarker test. 
              We'll recommend the exact supplements your body needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/pricing">View Testing Packages</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/#contact">Book a Consultation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Supplements;
