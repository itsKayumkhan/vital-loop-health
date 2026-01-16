import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Download, ExternalLink, Users, Shield, Zap, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const WebflowIntegrationDocs = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const portalIframeCode = `<iframe 
  src="https://YOUR-PUBLISHED-URL.lovable.app/embed-portal"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;

  const crmIframeCode = `<iframe 
  src="https://YOUR-PUBLISHED-URL.lovable.app/embed-crm"
  width="100%"
  height="100vh"
  frameborder="0"
  style="border: none; min-height: 900px;"
></iframe>`;

  const webhookExample = `// Zapier/Webhook Endpoint for Lead Capture
POST https://hsrhnhqksxkkqshrrzal.supabase.co/functions/v1/webhook-create-lead

Headers:
  Content-Type: application/json
  x-webhook-secret: YOUR_WEBHOOK_SECRET

Body (JSON):
{
  "email": "lead@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "lead_source": "webflow_contact_form",
  "health_goals": "Weight loss and better sleep",
  "notes": "Interested in wellness program"
}`;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, contentWidth);
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += fontSize * 0.5;
      });
      yPos += 5;
    };

    // Title
    doc.setTextColor(26, 26, 26);
    addWrappedText("VitalityX Webflow Integration Guide", 24, true);
    yPos += 5;

    addWrappedText("Technical Documentation for Development Team", 12);
    addWrappedText(`Generated: ${new Date().toLocaleDateString()}`, 10);
    yPos += 10;

    // Section 1: Overview
    addWrappedText("1. OVERVIEW", 16, true);
    addWrappedText("This document outlines how to integrate the VitalityX CRM and Client Portal into your Webflow site using iframes and webhooks.", 11);
    yPos += 5;

    // Section 2: CRM Integration
    addWrappedText("2. CRM ACCESS FOR STAFF", 16, true);
    addWrappedText("URL Path: /embed-crm", 11, true);
    addWrappedText("The CRM provides staff with tools to manage clients, memberships, purchases, documents, and marketing campaigns.", 11);
    yPos += 3;

    addWrappedText("Staff Roles:", 12, true);
    addWrappedText("• admin - Full CRM access including dashboards, analytics, and role management", 10);
    addWrappedText("• health_architect - Client management, programs, and marketing access", 10);
    addWrappedText("• coach - Access to assigned clients, intake forms, and documents only", 10);
    yPos += 3;

    addWrappedText("Setup Process:", 12, true);
    addWrappedText("1. Staff members create accounts at /auth", 10);
    addWrappedText("2. Admin assigns roles via CRM → Role Management", 10);
    addWrappedText("3. Embed CRM iframe on internal/staff page", 10);
    yPos += 5;

    // Section 3: Portal Integration
    addWrappedText("3. CLIENT PORTAL INTEGRATION", 16, true);
    addWrappedText("URL Path: /embed-portal", 11, true);
    addWrappedText("The client portal allows members to view their membership status, purchase history, assigned coaches, intake forms, and shared documents.", 11);
    yPos += 3;

    addWrappedText("Portal Features:", 12, true);
    addWrappedText("• Membership status and history", 10);
    addWrappedText("• Purchase history and invoices", 10);
    addWrappedText("• Assigned coaches list", 10);
    addWrappedText("• Intake form submissions", 10);
    addWrappedText("• Shared documents access", 10);
    addWrappedText("• Program assessments (Sleep, Mental Performance)", 10);
    yPos += 5;

    // New page for code examples
    doc.addPage();
    yPos = 20;

    addWrappedText("4. EMBED CODE EXAMPLES", 16, true);
    yPos += 3;

    addWrappedText("Client Portal Iframe:", 12, true);
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    const portalCode = portalIframeCode.split('\n');
    portalCode.forEach(line => {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.text(line, margin, yPos);
      yPos += 4;
    });
    yPos += 8;

    doc.setFont("helvetica", "bold");
    addWrappedText("Staff CRM Iframe:", 12, true);
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    const crmCode = crmIframeCode.split('\n');
    crmCode.forEach(line => {
      if (yPos > 270) { doc.addPage(); yPos = 20; }
      doc.text(line, margin, yPos);
      yPos += 4;
    });
    yPos += 10;

    // Section 5: Webhook Integration
    addWrappedText("5. ZAPIER/WEBHOOK LEAD CAPTURE", 16, true);
    addWrappedText("Connect Webflow forms to automatically create leads in the CRM.", 11);
    yPos += 3;

    addWrappedText("Webhook Endpoint:", 12, true);
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    doc.text("POST /functions/v1/webhook-create-lead", margin, yPos);
    yPos += 8;

    doc.setFont("helvetica", "normal");
    addWrappedText("Required Headers:", 12, true);
    addWrappedText("• Content-Type: application/json", 10);
    addWrappedText("• x-webhook-secret: [Your configured secret]", 10);
    yPos += 3;

    addWrappedText("Supported Fields:", 12, true);
    addWrappedText("• email (required) - Lead's email address", 10);
    addWrappedText("• full_name - Lead's full name", 10);
    addWrappedText("• phone - Phone number", 10);
    addWrappedText("• lead_source - e.g., 'webflow_contact_form'", 10);
    addWrappedText("• health_goals - Client's stated goals", 10);
    addWrappedText("• notes - Additional notes", 10);
    addWrappedText("• referral_source - How they found you", 10);

    // New page for setup steps
    doc.addPage();
    yPos = 20;

    addWrappedText("6. IMPLEMENTATION CHECKLIST", 16, true);
    yPos += 3;

    const checklist = [
      "□ Get published URL from Lovable (click Publish button)",
      "□ Replace 'YOUR-PUBLISHED-URL' in iframe code with actual URL",
      "□ Create Webflow page for client portal (e.g., /my-account)",
      "□ Add portal iframe embed to client page",
      "□ Create internal/staff page for CRM (e.g., /staff-crm)",
      "□ Add CRM iframe embed to staff page",
      "□ Create initial admin account at /auth",
      "□ Configure webhook secret for Zapier integration",
      "□ Set up Zapier/Make workflow for form submissions",
      "□ Test lead capture with sample form submission",
      "□ Test portal login and data display",
      "□ Configure SSL and domain settings if using custom domain"
    ];

    checklist.forEach(item => {
      addWrappedText(item, 11);
    });
    yPos += 10;

    addWrappedText("7. SUPPORT & TROUBLESHOOTING", 16, true);
    addWrappedText("Common Issues:", 12, true);
    addWrappedText("• Iframe not loading: Check CORS settings and ensure HTTPS", 10);
    addWrappedText("• Login not working: Verify auth redirect URLs include Webflow domain", 10);
    addWrappedText("• Webhook failing: Confirm secret header matches configured value", 10);
    addWrappedText("• Data not syncing: Check browser console for API errors", 10);

    doc.save("VitalityX-Webflow-Integration-Guide.pdf");
    toast.success("PDF downloaded successfully!");
  };

  return (
    <>
      <Helmet>
        <title>Webflow Integration Guide | VitalityX</title>
        <meta name="description" content="Technical documentation for integrating VitalityX CRM and Portal with Webflow" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Webflow Integration Guide
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Technical documentation for your development team
            </p>
            <Button onClick={generatePDF} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Download PDF Guide
            </Button>
          </div>

          {/* CRM Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                CRM Access for Staff
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">URL Path</h3>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-2 rounded text-sm flex-1">/embed-crm</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard("/embed-crm", "Path")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Embed at a URL like <code>yoursite.com/staff-crm</code> using an iframe
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Staff Roles</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <span className="font-medium">admin</span>
                      <p className="text-sm text-muted-foreground">Full CRM access (dashboards, analytics, role management)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-secondary mt-0.5" />
                    <div>
                      <span className="font-medium">health_architect</span>
                      <p className="text-sm text-muted-foreground">Client management, programs, marketing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">coach</span>
                      <p className="text-sm text-muted-foreground">Assigned clients, intake forms, documents</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Setup Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create user accounts for each team member at <code>/auth</code></li>
                  <li>Admin assigns roles via CRM → Role Management section</li>
                  <li>Embed CRM iframe on internal staff page</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Embed Code</h3>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {crmIframeCode}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(crmIframeCode, "CRM iframe code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portal Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-6 w-6 text-primary" />
                My VitalityX Portal for Clients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">URL Path</h3>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-3 py-2 rounded text-sm flex-1">/embed-portal</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard("/embed-portal", "Path")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Portal Features</h3>
                <ul className="grid grid-cols-2 gap-2 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Membership status & history</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Purchase history</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Assigned coaches</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Intake form submissions</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Shared documents</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Program assessments</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Embed Code</h3>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {portalIframeCode}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(portalIframeCode, "Portal iframe code")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Webhook Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Zapier/Webhook Lead Capture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Connect Webflow forms to automatically create leads in the CRM when visitors submit contact forms.
              </p>

              <div>
                <h3 className="font-semibold mb-2">Webhook Endpoint</h3>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {webhookExample}
                  </pre>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(webhookExample, "Webhook example")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Zapier Setup Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Create a new Zap with "Webflow" as the trigger</li>
                  <li>Select "Form Submission" as the trigger event</li>
                  <li>Add "Webhooks by Zapier" as the action</li>
                  <li>Choose "POST" request method</li>
                  <li>Enter the webhook URL with your project ID</li>
                  <li>Add the <code>x-webhook-secret</code> header</li>
                  <li>Map Webflow form fields to the JSON body</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Implementation Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Get published URL from Lovable (click Publish button)",
                  "Replace 'YOUR-PUBLISHED-URL' in iframe code with actual URL",
                  "Create Webflow page for client portal (e.g., /my-account)",
                  "Add portal iframe embed to client page",
                  "Create internal/staff page for CRM (e.g., /staff-crm)",
                  "Add CRM iframe embed to staff page",
                  "Create initial admin account at /auth",
                  "Configure webhook secret for Zapier integration",
                  "Set up Zapier/Make workflow for form submissions",
                  "Test lead capture with sample form submission",
                  "Test portal login and data display"
                ].map((item, index) => (
                  <label key={index} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                    <input type="checkbox" className="h-5 w-5 rounded" />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-12 text-muted-foreground">
            <p>Need help? Contact your VitalityX administrator.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebflowIntegrationDocs;
