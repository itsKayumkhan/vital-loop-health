import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import vitalityxLogo from '@/assets/vitalityx-logo.png';

const CGMIntakeForm = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Helmet>
                <title>CGM Intake Form | VitalityX Health</title>
                <meta
                    name="description"
                    content="Complete your CGM intake form before starting your 14-day continuous glucose monitoring protocol with VitalityX."
                />
            </Helmet>

            {/* Print-only styles */}
            <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .print-page {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .form-container {
            max-width: 100% !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          .form-container * {
            color: #1a1a1a !important;
          }
          .form-header {
            border-bottom: 2px solid #48B275 !important;
            padding-bottom: 16px !important;
            margin-bottom: 24px !important;
          }
          .form-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .input-line {
            border-bottom: 1px solid #ccc !important;
            min-height: 28px;
          }
          .checkbox-item {
            border: 1px solid #666 !important;
          }
        }
      `}</style>

            <main className="min-h-screen print-page">
                {/* Navigation - hidden on print */}
                <div className="no-print fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Link to="/programs" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Programs
                        </Link>
                        <div className="flex items-center gap-3">
                            <Button onClick={handlePrint} variant="hero" className="gap-2">
                                <Printer className="w-4 h-4" />
                                Print / Save as PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="container mx-auto px-4 pt-24 pb-16 no-print:pt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="form-container max-w-3xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12 shadow-xl"
                    >
                        {/* Header */}
                        <div className="form-header border-b-2 border-secondary pb-6 mb-8">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <img src={vitalityxLogo} alt="VitalityX" className="w-16 h-16 rounded-xl object-cover" />
                                    <div>
                                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">CGM Intake Form</h1>
                                        <p className="text-secondary font-medium">14-Day Glucose Monitoring Protocol</p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                    <p>VitalityX Health</p>
                                    <p>www.vitalityxhealth.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-secondary/10 rounded-xl p-4 mb-8 text-sm">
                            <p className="font-medium text-foreground mb-2">Instructions:</p>
                            <p className="text-muted-foreground">
                                Please complete this form before your 14-day CGM protocol begins. This information helps your Health Architect
                                and Nutrition Coach personalize your glucose optimization plan. Print this form or save as PDF to complete and
                                return to your coach.
                            </p>
                        </div>

                        {/* Section 1: Personal Information */}
                        <div className="form-section mb-8">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">1</span>
                                Personal Information
                            </h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Full Name</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Date of Birth</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Email</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Phone Number</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Height</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Current Weight</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Health History */}
                        <div className="form-section mb-8">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">2</span>
                                Health History
                            </h2>

                            <div className="mb-4">
                                <label className="text-sm text-muted-foreground block mb-2">Have you been diagnosed with any of the following? (Check all that apply)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['Type 1 Diabetes', 'Type 2 Diabetes', 'Prediabetes', 'PCOS', 'Insulin Resistance', 'Metabolic Syndrome', 'Thyroid Disorder', 'Cardiovascular Disease', 'None of the above'].map((condition) => (
                                        <div key={condition} className="flex items-center gap-2">
                                            <div className="checkbox-item w-4 h-4 border border-border rounded"></div>
                                            <span className="text-sm text-foreground">{condition}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-muted-foreground block mb-1">Current Medications (list all)</label>
                                <div className="input-line border-b border-border h-8 mb-2"></div>
                                <div className="input-line border-b border-border h-8"></div>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Current Supplements (list all)</label>
                                <div className="input-line border-b border-border h-8 mb-2"></div>
                                <div className="input-line border-b border-border h-8"></div>
                            </div>
                        </div>

                        {/* Section 3: Lifestyle & Nutrition */}
                        <div className="form-section mb-8">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">3</span>
                                Lifestyle & Nutrition
                            </h2>

                            <div className="mb-4">
                                <label className="text-sm text-muted-foreground block mb-2">Current dietary approach (Check one)</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {['No specific diet', 'Low Carb / Keto', 'Mediterranean', 'Paleo', 'Vegetarian / Vegan', 'Intermittent Fasting', 'Other'].map((diet) => (
                                        <div key={diet} className="flex items-center gap-2">
                                            <div className="checkbox-item w-4 h-4 border border-border rounded-full"></div>
                                            <span className="text-sm text-foreground">{diet}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Average meals per day</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Typical eating window (e.g., 8am-8pm)</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="text-sm text-muted-foreground block mb-2">Exercise frequency</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Sedentary', '1-2x/week', '3-4x/week', '5+x/week'].map((freq) => (
                                        <div key={freq} className="flex items-center gap-2">
                                            <div className="checkbox-item w-4 h-4 border border-border rounded-full"></div>
                                            <span className="text-sm text-foreground">{freq}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Average sleep per night</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Stress level (1-10)</label>
                                    <div className="input-line border-b border-border h-8"></div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Goals */}
                        <div className="form-section mb-8">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">4</span>
                                Your Goals
                            </h2>

                            <div className="mb-4">
                                <label className="text-sm text-muted-foreground block mb-2">What are your primary goals for this CGM protocol? (Check all that apply)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {[
                                        'Understand my glucose response to foods',
                                        'Improve energy levels throughout the day',
                                        'Optimize body composition / weight loss',
                                        'Improve athletic performance',
                                        'Better sleep quality',
                                        'Manage or prevent diabetes',
                                        'Reduce sugar cravings',
                                        'Improve metabolic health markers'
                                    ].map((goal) => (
                                        <div key={goal} className="flex items-center gap-2">
                                            <div className="checkbox-item w-4 h-4 border border-border rounded"></div>
                                            <span className="text-sm text-foreground">{goal}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground block mb-1">Anything else you'd like us to know?</label>
                                <div className="input-line border-b border-border h-8 mb-2"></div>
                                <div className="input-line border-b border-border h-8 mb-2"></div>
                                <div className="input-line border-b border-border h-8"></div>
                            </div>
                        </div>

                        {/* Section 5: Acknowledgment */}
                        <div className="form-section mb-8">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm">5</span>
                                Acknowledgment
                            </h2>

                            <div className="bg-muted/30 rounded-lg p-4 mb-4 text-sm text-muted-foreground">
                                <p className="mb-3">
                                    I understand that the CGM protocol is for educational and wellness purposes only and does not replace
                                    medical advice. I will consult with my physician before making significant changes to my diet or
                                    medication based on CGM data.
                                </p>
                                <p>
                                    I agree to log my meals, activities, and sleep during the 14-day protocol to maximize the value of
                                    my data analysis and coaching session.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Signature</label>
                                    <div className="input-line border-b border-border h-12"></div>
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground block mb-1">Date</label>
                                    <div className="input-line border-b border-border h-12"></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-border pt-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                Please return this completed form to your Health Architect before your CGM device ships.
                            </p>
                            <p className="text-xs text-secondary mt-2 font-medium">
                                VitalityX Health — Optimize Your Potential
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom action bar - hidden on print */}
                <div className="no-print fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border py-4">
                    <div className="container mx-auto px-4 flex justify-center">
                        <Button onClick={handlePrint} variant="hero" size="lg" className="gap-2">
                            <Download className="w-5 h-5" />
                            Download as PDF
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
};

export default CGMIntakeForm;
