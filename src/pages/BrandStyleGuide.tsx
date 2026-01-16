import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Copy, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const brandColors = [
  { name: 'Dark Blue (Background)', hex: '#0B1A21', hsl: '200, 63%, 8%', usage: 'Main background color' },
  { name: 'Primary Blue', hex: '#0A2E43', hsl: '200, 73%, 15%', usage: 'Primary brand color, headers' },
  { name: 'Green (Accent)', hex: '#48B275', hsl: '151, 44%, 49%', usage: 'CTA buttons, highlights, links' },
  { name: 'Foreground White', hex: '#FAFAFA', hsl: '0, 0%, 98%', usage: 'Primary text, headings' },
  { name: 'Muted Text', hex: '#8FA3AD', hsl: '200, 15%, 65%', usage: 'Secondary text, descriptions' },
  { name: 'Card Background', hex: '#122A36', hsl: '200, 63%, 12%', usage: 'Card surfaces, elevated elements' },
  { name: 'Border', hex: '#2A4A5A', hsl: '200, 30%, 25%', usage: 'Borders, dividers, separators' },
  { name: 'Green Light', hex: '#6BC994', hsl: '151, 44%, 60%', usage: 'Hover states, secondary accents' },
  { name: 'Green Glow', hex: '#3DB86B', hsl: '151, 60%, 45%', usage: 'Glow effects, emphasis' },
  { name: 'Destructive Red', hex: '#EF4444', hsl: '0, 84%, 60%', usage: 'Errors, warnings, destructive actions' },
];

const typography = {
  fontFamily: 'Montserrat',
  weights: [
    { weight: 400, name: 'Regular', usage: 'Body text, paragraphs' },
    { weight: 500, name: 'Medium', usage: 'Navigation, labels' },
    { weight: 600, name: 'Semi Bold', usage: 'Subheadings, emphasis' },
    { weight: 700, name: 'Bold', usage: 'Headings, CTAs' },
    { weight: 800, name: 'Extra Bold', usage: 'Hero text, large headings' },
    { weight: 900, name: 'Black', usage: 'Display text, logos' },
  ],
  scale: [
    { size: '48px - 72px', name: 'Display/Hero', usage: 'Main hero headlines' },
    { size: '36px - 48px', name: 'H1', usage: 'Page titles' },
    { size: '28px - 36px', name: 'H2', usage: 'Section headings' },
    { size: '20px - 24px', name: 'H3', usage: 'Subsection headings' },
    { size: '16px - 18px', name: 'Body', usage: 'Paragraphs, descriptions' },
    { size: '14px', name: 'Small', usage: 'Labels, captions, meta' },
    { size: '12px', name: 'Tiny', usage: 'Fine print, badges' },
  ],
};

const gradients = [
  { 
    name: 'Hero Gradient', 
    css: 'linear-gradient(135deg, #0F2A38 0%, #0B1A21 50%, #0D2626 100%)',
    usage: 'Main page backgrounds'
  },
  { 
    name: 'Accent Gradient', 
    css: 'linear-gradient(135deg, #48B275 0%, #338C5C 100%)',
    usage: 'CTA buttons, highlighted elements'
  },
  { 
    name: 'Card Gradient', 
    css: 'linear-gradient(180deg, #163442 0%, #0F232D 100%)',
    usage: 'Card backgrounds, elevated surfaces'
  },
  { 
    name: 'Glow Effect', 
    css: 'radial-gradient(ellipse at center, rgba(72, 178, 117, 0.15) 0%, transparent 70%)',
    usage: 'Ambient glow behind key elements'
  },
];

const usageGuidelines = [
  {
    title: 'Color Usage',
    rules: [
      'Use Dark Blue (#0B1A21) as the primary background for all pages',
      'Green (#48B275) should be reserved for CTAs, links, and important highlights',
      'Maintain high contrast between text and backgrounds for accessibility',
      'Use muted colors for secondary information to create visual hierarchy',
    ]
  },
  {
    title: 'Typography',
    rules: [
      'Montserrat is the sole font family - do not mix with other fonts',
      'Use heavier weights (700-900) for headings, lighter (400-500) for body',
      'Maintain consistent line heights: 1.2 for headings, 1.6 for body text',
      'Letter spacing: -0.02em for large headings, normal for body text',
    ]
  },
  {
    title: 'Spacing & Layout',
    rules: [
      'Border radius: 0.75rem (12px) for cards and buttons',
      'Consistent padding: 16px mobile, 24px tablet, 32px desktop',
      'Section spacing: 80px-120px between major sections',
      'Card shadows: Use subtle dark shadows with green glow for emphasis',
    ]
  },
  {
    title: 'Brand Voice',
    rules: [
      'Professional yet approachable - we are health experts, not robots',
      'Use "you" language to speak directly to the reader',
      'Focus on transformation and results, not just features',
      'Avoid medical jargon - explain complex concepts simply',
    ]
  },
];

const BrandStyleGuide = () => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyToClipboard = (text: string, colorName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(colorName);
    toast.success(`Copied ${text}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(10, 46, 67); // Primary Blue
    doc.text('VitalityX Brand Style Guide', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 20;

    // Colors Section
    doc.setFontSize(16);
    doc.setTextColor(10, 46, 67);
    doc.text('Brand Colors', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(60);

    brandColors.forEach((color) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      // Color swatch (simulated with rectangle)
      const hex = color.hex.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      doc.setFillColor(r, g, b);
      doc.rect(20, y - 4, 10, 10, 'F');
      
      doc.setTextColor(40);
      doc.text(`${color.name}`, 35, y);
      doc.text(`HEX: ${color.hex}`, 35, y + 5);
      doc.setTextColor(100);
      doc.text(`Usage: ${color.usage}`, 100, y + 2.5);
      y += 15;
    });

    // Typography Section
    doc.addPage();
    y = 20;

    doc.setFontSize(16);
    doc.setTextColor(10, 46, 67);
    doc.text('Typography', 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text('Font Family: Montserrat', 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.text('Google Fonts: https://fonts.google.com/specimen/Montserrat', 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.text('Font Weights:', 20, y);
    y += 8;

    doc.setFontSize(10);
    typography.weights.forEach((weight) => {
      doc.text(`• ${weight.weight} (${weight.name}) - ${weight.usage}`, 25, y);
      y += 6;
    });

    y += 10;
    doc.setFontSize(12);
    doc.text('Type Scale:', 20, y);
    y += 8;

    doc.setFontSize(10);
    typography.scale.forEach((size) => {
      doc.text(`• ${size.name} (${size.size}) - ${size.usage}`, 25, y);
      y += 6;
    });

    // Gradients Section
    y += 15;
    doc.setFontSize(16);
    doc.setTextColor(10, 46, 67);
    doc.text('Gradients', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(40);
    gradients.forEach((gradient) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.text(`${gradient.name}:`, 20, y);
      y += 5;
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(gradient.css, 25, y);
      y += 5;
      doc.text(`Usage: ${gradient.usage}`, 25, y);
      doc.setTextColor(40);
      y += 10;
    });

    // Usage Guidelines
    doc.addPage();
    y = 20;

    doc.setFontSize(16);
    doc.setTextColor(10, 46, 67);
    doc.text('Usage Guidelines', 20, y);
    y += 15;

    usageGuidelines.forEach((section) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(10, 46, 67);
      doc.text(section.title, 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setTextColor(60);
      section.rules.forEach((rule) => {
        const lines = doc.splitTextToSize(`• ${rule}`, pageWidth - 45);
        lines.forEach((line: string) => {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, 25, y);
          y += 5;
        });
      });
      y += 10;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`VitalityX Brand Style Guide - Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }

    doc.save('VitalityX-Brand-Style-Guide.pdf');
    toast.success('Brand Style Guide PDF downloaded!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Brand Style Guide</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Complete visual identity guidelines for VitalityX. Use these specifications 
              to maintain brand consistency across all materials.
            </p>
            <Button onClick={generatePDF} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download PDF Style Guide
            </Button>
          </div>

          {/* Colors Section */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8">Brand Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brandColors.map((color) => (
                <Card key={color.name} className="overflow-hidden">
                  <div 
                    className="h-24 w-full" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{color.name}</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{color.hex}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => copyToClipboard(color.hex, color.name)}
                      >
                        {copiedColor === color.name ? (
                          <Check className="w-4 h-4 text-secondary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">HSL: {color.hsl}</p>
                    <p className="text-sm text-muted-foreground mt-2">{color.usage}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8">Typography</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Font Family</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold mb-4">Montserrat</p>
                  <p className="text-muted-foreground mb-4">
                    Available from Google Fonts. Use for all text across the brand.
                  </p>
                  <div className="space-y-2">
                    {typography.weights.map((w) => (
                      <div key={w.weight} className="flex items-center justify-between">
                        <span style={{ fontWeight: w.weight }}>{w.name} ({w.weight})</span>
                        <span className="text-sm text-muted-foreground">{w.usage}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Type Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {typography.scale.map((size) => (
                    <div key={size.name} className="border-b border-border pb-2 last:border-0">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold">{size.name}</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{size.size}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{size.usage}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Gradients Section */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8">Gradients</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {gradients.map((gradient) => (
                <Card key={gradient.name} className="overflow-hidden">
                  <div 
                    className="h-32 w-full" 
                    style={{ background: gradient.css }}
                  />
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{gradient.name}</h3>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mb-2 overflow-x-auto">
                      {gradient.css}
                    </code>
                    <p className="text-sm text-muted-foreground">{gradient.usage}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Usage Guidelines */}
          <section className="mb-20">
            <h2 className="text-2xl font-bold mb-8">Usage Guidelines</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {usageGuidelines.map((section) => (
                <Card key={section.title}>
                  <CardHeader>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-secondary mt-1">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Download CTA */}
          <div className="text-center">
            <Button onClick={generatePDF} size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download Complete PDF
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrandStyleGuide;
