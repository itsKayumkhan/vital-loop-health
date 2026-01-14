import { useMemo, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { Users, DollarSign, TrendingUp, Calendar, Download, FileText, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type DrillDownType = 'clients' | 'revenue' | 'newClients';

export type DrillDownData = {
  type: DrillDownType;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  clients?: Array<{
    id: string;
    full_name: string;
    email: string;
    created_at: string;
    marketing_status: string | null;
  }>;
  purchases?: Array<{
    id: string;
    product_name: string;
    amount: number;
    purchase_type: string;
    purchased_at: string;
    client_name?: string;
  }>;
};

interface ChartDrillDownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DrillDownData | null;
}

const statusColors: Record<string, string> = {
  lead: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
  prospect: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  customer: 'bg-green-500/20 text-green-700 border-green-500/30',
  vip: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  churned: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const purchaseTypeColors: Record<string, string> = {
  subscription: 'bg-primary/20 text-primary border-primary/30',
  one_time: 'bg-green-500/20 text-green-700 border-green-500/30',
  supplement: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  service: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
};

export function ChartDrillDown({ open, onOpenChange, data }: ChartDrillDownProps) {
  const title = useMemo(() => {
    if (!data) return '';
    switch (data.type) {
      case 'clients':
        return `Total Clients - ${data.period}`;
      case 'newClients':
        return `New Clients - ${data.period}`;
      case 'revenue':
        return `Revenue Details - ${data.period}`;
      default:
        return data.period;
    }
  }, [data]);

  const icon = useMemo(() => {
    if (!data) return null;
    switch (data.type) {
      case 'clients':
      case 'newClients':
        return <Users className="h-5 w-5" />;
      case 'revenue':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  }, [data?.type]);

  const summary = useMemo(() => {
    if (!data) return null;
    if (data.type === 'revenue' && data.purchases) {
      const total = data.purchases.reduce((sum, p) => sum + p.amount, 0);
      const byType = data.purchases.reduce((acc, p) => {
        acc[p.purchase_type] = (acc[p.purchase_type] || 0) + p.amount;
        return acc;
      }, {} as Record<string, number>);
      return { total, byType, count: data.purchases.length };
    }
    if ((data.type === 'clients' || data.type === 'newClients') && data.clients) {
      const byStatus = data.clients.reduce((acc, c) => {
        const status = c.marketing_status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return { count: data.clients.length, byStatus };
    }
    return null;
  }, [data]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    if (!data) return;

    let csvContent = '';
    const dateRange = `${format(data.periodStart, 'MMM d, yyyy')} - ${format(data.periodEnd, 'MMM d, yyyy')}`;

    if (data.type === 'revenue' && data.purchases) {
      csvContent = 'Product Name,Amount,Type,Client,Date\n';
      data.purchases.forEach(p => {
        csvContent += `"${p.product_name}","$${p.amount.toLocaleString()}","${p.purchase_type.replace('_', ' ')}","${p.client_name || 'Unknown'}","${format(parseISO(p.purchased_at), 'MMM d, yyyy h:mm a')}"\n`;
      });
    } else if (data.clients) {
      csvContent = 'Name,Email,Status,Created Date\n';
      data.clients.forEach(c => {
        csvContent += `"${c.full_name}","${c.email}","${c.marketing_status || 'N/A'}","${format(parseISO(c.created_at), 'MMM d, yyyy')}"\n`;
      });
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.type}-${data.period.replace(/[^a-zA-Z0-9]/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    if (!data) return;

    const doc = new jsPDF();
    const dateRange = `${format(data.periodStart, 'MMM d, yyyy')} - ${format(data.periodEnd, 'MMM d, yyyy')}`;

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    // Date range
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(dateRange, 14, 30);

    // Summary section
    doc.setTextColor(0);
    doc.setFontSize(12);
    
    let yPos = 40;

    if (data.type === 'revenue' && data.purchases && summary && 'total' in summary) {
      doc.text(`Total Revenue: $${summary.total.toLocaleString()}`, 14, yPos);
      yPos += 8;
      doc.text(`Transactions: ${summary.count}`, 14, yPos);
      yPos += 15;

      // Table
      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'Amount', 'Type', 'Client', 'Date']],
        body: data.purchases.map(p => [
          p.product_name,
          `$${p.amount.toLocaleString()}`,
          p.purchase_type.replace('_', ' '),
          p.client_name || 'Unknown',
          format(parseISO(p.purchased_at), 'MMM d, yyyy'),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    } else if (data.clients && summary && 'byStatus' in summary) {
      doc.text(`Total ${data.type === 'newClients' ? 'New ' : ''}Clients: ${summary.count}`, 14, yPos);
      yPos += 15;

      // Table
      autoTable(doc, {
        startY: yPos,
        head: [['Name', 'Email', 'Status', 'Created']],
        body: data.clients.map(c => [
          c.full_name,
          c.email,
          c.marketing_status || 'N/A',
          format(parseISO(c.created_at), 'MMM d, yyyy'),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    // Save the PDF
    doc.save(`${data.type}-${data.period.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`);
  }, [data, title, summary]);

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {icon}
              {title}
            </DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV} className="gap-2 cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} className="gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(data.periodStart, 'MMM d, yyyy')} - {format(data.periodEnd, 'MMM d, yyyy')}
          </div>
        </DialogHeader>

        <Separator />

        {/* Summary Section */}
        {summary && (
          <div className="px-6 py-4 bg-muted/30">
            {data.type === 'revenue' && 'total' in summary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${summary.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary.byType).map(([type, amount]) => (
                    <Badge key={type} variant="outline" className={purchaseTypeColors[type]}>
                      {type.replace('_', ' ')}: ${(amount as number).toLocaleString()}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {summary.count} transaction{summary.count !== 1 ? 's' : ''}
                </div>
              </div>
            )}
            {(data.type === 'clients' || data.type === 'newClients') && 'byStatus' in summary && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {data.type === 'newClients' ? 'New Clients' : 'Total Clients'}
                  </span>
                  <span className="text-2xl font-bold">{summary.count}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(summary.byStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className={statusColors[status] || 'bg-muted'}>
                      {status}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Detail List */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-6 pt-4 space-y-3">
            {data.type === 'revenue' && data.purchases && (
              <>
                {data.purchases.length > 0 ? (
                  data.purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{purchase.product_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-xs", purchaseTypeColors[purchase.purchase_type])}>
                            {purchase.purchase_type.replace('_', ' ')}
                          </Badge>
                          {purchase.client_name && (
                            <span className="text-xs text-muted-foreground">
                              {purchase.client_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${purchase.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(purchase.purchased_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No purchases in this period
                  </div>
                )}
              </>
            )}

            {(data.type === 'clients' || data.type === 'newClients') && data.clients && (
              <>
                {data.clients.length > 0 ? (
                  data.clients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <div className="text-right space-y-1">
                        {client.marketing_status && (
                          <Badge variant="outline" className={cn("text-xs", statusColors[client.marketing_status])}>
                            {client.marketing_status}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(client.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No clients in this period
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
