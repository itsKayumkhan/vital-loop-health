import { useState } from 'react';
import { FileText, Search, Upload, Download, Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCRMDocuments, useCRMClients } from '@/hooks/useCRM';
import { DocumentType, CRMClient } from '@/types/crm';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const typeColors: Record<DocumentType, string> = {
  contract: 'bg-blue-500/10 text-blue-500',
  lab_results: 'bg-purple-500/10 text-purple-500',
  health_record: 'bg-green-500/10 text-green-500',
  invoice: 'bg-amber-500/10 text-amber-500',
  other: 'bg-gray-500/10 text-gray-500',
};

const typeLabels: Record<DocumentType, string> = {
  contract: 'Contract',
  lab_results: 'Lab Results',
  health_record: 'Health Record',
  invoice: 'Invoice',
  other: 'Other',
};

export function DocumentsList() {
  const { documents, loading: documentsLoading, deleteDocument } = useCRMDocuments();
  const { clients, loading: clientsLoading } = useCRMClients();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loading = documentsLoading || clientsLoading;

  const clientsMap = clients.reduce((acc, client) => {
    acc[client.id] = client;
    return acc;
  }, {} as Record<string, CRMClient>);

  const filteredDocuments = documents.filter(doc => {
    const client = clientsMap[doc.client_id];
    const matchesSearch = 
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (client && (
        client.full_name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase())
      ));
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: documents.length,
    contracts: documents.filter(d => d.document_type === 'contract').length,
    labResults: documents.filter(d => d.document_type === 'lab_results').length,
    healthRecords: documents.filter(d => d.document_type === 'health_record').length,
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground">Manage client documents and files</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Documents</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Contracts</p>
            <p className="text-2xl font-bold text-blue-500">{stats.contracts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Lab Results</p>
            <p className="text-2xl font-bold text-purple-500">{stats.labResults}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Health Records</p>
            <p className="text-2xl font-bold text-green-500">{stats.healthRecords}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="lab_results">Lab Results</SelectItem>
            <SelectItem value="health_record">Health Record</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No documents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => {
            const client = clientsMap[doc.client_id];
            return (
              <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {client?.full_name || 'Unknown Client'} • {format(new Date(doc.created_at), 'MMM d, yyyy')} • {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={typeColors[doc.document_type]}>
                        {typeLabels[doc.document_type]}
                      </Badge>
                      {doc.shared_with_client && (
                        <Badge variant="outline" className="text-xs">
                          Shared
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteDocument(doc.id, doc.file_path)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
