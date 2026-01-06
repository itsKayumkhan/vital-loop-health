import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ShoppingCart, Check, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSupplementById, supplements } from '@/data/supplements';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const supplement = getSupplementById(id || '');

  if (!supplement) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-8">The supplement you're looking for doesn't exist.</p>
            <Link to="/supplements">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Supplements
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Get related products (same category, excluding current)
  const relatedProducts = supplements
    .filter(s => s.category === supplement.category && s.id !== supplement.id)
    .slice(0, 3);

  return (
    <>
      <Helmet>
        <title>{supplement.name} | VitalityX Supplements</title>
        <meta name="description" content={supplement.description} />
      </Helmet>

      <Navbar />

      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Link */}
          <Link 
            to="/supplements" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Supplements
          </Link>

          {/* Product Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16"
          >
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted/20 border border-border">
                <img
                  src={supplement.image}
                  alt={supplement.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {supplement.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-background/90 backdrop-blur-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <Badge variant="outline" className="w-fit mb-4 border-secondary/50 text-secondary">
                {supplement.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {supplement.name}
              </h1>
              <p className="text-sm text-muted-foreground mb-4">SKU: {supplement.sku}</p>
              <p className="text-lg text-muted-foreground mb-6">
                {supplement.fullDescription}
              </p>

              {/* Benefits */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">KEY BENEFITS</h3>
                <div className="flex flex-wrap gap-2">
                  {supplement.benefits.map((benefit) => (
                    <Badge key={benefit} variant="outline" className="px-3 py-1">
                      <Check className="w-3 h-3 mr-1 text-secondary" />
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Form & Servings */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">Form</p>
                  <p className="font-semibold">{supplement.form}</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <p className="text-sm text-muted-foreground">Serving Size</p>
                  <p className="font-semibold">{supplement.servingSize}</p>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-3xl font-bold text-secondary">${supplement.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Per Serving</p>
                    <p className="text-lg font-semibold">
                      ${(supplement.price / supplement.servingsPerContainer).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button className="w-full" size="lg">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Supplement Facts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <Card className="glass-card border-secondary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="w-6 h-6 text-secondary" />
                  Supplement Facts
                </CardTitle>
                <p className="text-muted-foreground">
                  Serving Size: {supplement.servingSize} | Servings Per Container: {supplement.servingsPerContainer}
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">Ingredient</TableHead>
                      <TableHead className="text-right">Amount Per Serving</TableHead>
                      <TableHead className="text-right">% Daily Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplement.ingredients.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell className="text-right">{ingredient.amount}</TableCell>
                        <TableCell className="text-right">
                          {ingredient.dailyValue || '*'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-sm text-muted-foreground mt-4">
                  * Daily Value not established
                </p>

                <Separator className="my-6" />

                {/* Other Ingredients */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Other Ingredients</h4>
                  <p className="text-muted-foreground">
                    {supplement.otherIngredients.join(', ')}
                  </p>
                </div>

                {/* Suggested Use */}
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 mb-6">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    Suggested Use
                  </h4>
                  <p className="text-muted-foreground">{supplement.suggestedUse}</p>
                </div>

                {/* Warnings */}
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings
                  </h4>
                  <ul className="space-y-1">
                    {supplement.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <Link key={product.id} to={`/supplements/${product.id}`}>
                    <Card className="h-full glass-card border-secondary/20 hover:border-secondary/50 transition-all duration-300 group">
                      <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1 group-hover:text-secondary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {product.description}
                        </p>
                        <p className="text-lg font-bold text-secondary">
                          ${product.price.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetail;
