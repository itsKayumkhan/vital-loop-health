import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Search, Filter, Eye, Edit, MoreHorizontal } from 'lucide-react';
import { useMentalAssessments } from '@/hooks/useMentalPerformance';
import { 
  mentalPhenotypeLabels, 
  mentalTierLabels, 
  getCognitiveSeverity,
  MentalPerformanceStatus 
} from '@/types/mentalPerformance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusColors: Record<MentalPerformanceStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  reviewed: 'bg-purple-100 text-purple-800',
};

export function MentalAssessmentsList() {
  const { assessments, loading } = useMentalAssessments();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.client_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    const matchesTier = tierFilter === 'all' || assessment.program_tier === tierFilter;
    return matchesSearch && matchesStatus && matchesTier;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Mental Performance Assessments
            </CardTitle>
            <CardDescription>
              View and manage all client cognitive assessments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Program Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="cognitive_foundations">Cognitive Foundations</SelectItem>
              <SelectItem value="performance_optimization">Performance Optimization</SelectItem>
              <SelectItem value="elite_cognition">Elite Cognition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phenotype</TableHead>
                <TableHead>Program Tier</TableHead>
                <TableHead>Cognitive Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No assessments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment) => {
                  const cognitiveScore = assessment.cognitive_function_score ?? 0;
                  const severity = getCognitiveSeverity(cognitiveScore);
                  
                  return (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[assessment.status]}>
                          {assessment.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.phenotype ? (
                          <Badge variant="outline">
                            {mentalPhenotypeLabels[assessment.phenotype]}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Not classified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {mentalTierLabels[assessment.program_tier]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={severity.color}>{cognitiveScore}/20</span>
                          <span className="text-xs text-muted-foreground">
                            ({severity.label})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Assessment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
