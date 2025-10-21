'use client';

import * as React from 'react';
import {
  legalSearch,
  type LegalSearchInput,
  type LegalSearchOutput,
} from '@/ai/flows/legal-search';
import { Bot, ExternalLink, Loader2, Search as SearchIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type FilterId = 'ipc' | 'crpc' | 'cpc' | 'contract-act' | 'const';

const filterOptions: { id: FilterId; label: string }[] = [
  { id: 'ipc', label: 'IPC' },
  { id: 'crpc', label: 'CrPC' },
  { id: 'cpc', label: 'CPC' },
  { id: 'contract-act', label: 'Contract Act' },
  { id: 'const', label: 'Constitution' },
];

export default function LegalSearchPage() {
  const [query, setQuery] = React.useState('');
  const [filters, setFilters] = React.useState<Record<FilterId, boolean>>({
    ipc: false,
    crpc: false,
    cpc: false,
    'contract-act': false,
    const: false,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [results, setResults] = React.useState<LegalSearchOutput | null>(null);
  const { toast } = useToast();

  const handleFilterChange = (id: FilterId, checked: boolean) => {
    setFilters((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty Search Query',
        description: 'Please enter a query to start the search.',
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    const searchInput: LegalSearchInput = {
      query,
      filters: {
        ...filters,
      },
    };

    try {
      const searchResults = await legalSearch(searchInput);
      setResults(searchResults);
    } catch (error) {
      console.error('Error performing legal search:', error);
      toast({
        variant: 'destructive',
        title: 'Search Failed',
        description:
          'An unexpected error occurred while searching. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI-Powered Legal Search
        </h1>
        <p className="mt-2 text-muted-foreground">
          Search public Indian legal precedents using natural language.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select defaultValue="india">
                  <SelectTrigger id="jurisdiction">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="other" disabled>
                      Other (coming soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Legal Taxonomy</Label>
                {filterOptions.map(({ id, label }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={id}
                      checked={filters[id]}
                      onCheckedChange={(checked) =>
                        handleFilterChange(id, !!checked)
                      }
                    />
                    <Label htmlFor={id} className="font-normal">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search with natural language... e.g., 'precedents for anticipatory bail in fraud cases'"
                className="w-full pl-10 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Search
              </Button>
            </div>
          </form>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Relevant cases and statutes from Indian Kanoon will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex min-h-[400px] flex-col items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Searching Indian Kanoon...
                  </p>
                </div>
              )}
              {!isLoading && results && results.length > 0 && (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Alert key={result.docid}>
                      <div className='flex justify-between items-start'>
                        <div>
                          <AlertTitle className="font-bold">
                            <Link
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {result.title}
                            </Link>
                          </AlertTitle>
                          <AlertDescription className="mt-2">{result.snippet}</AlertDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={result.url} target="_blank" rel="noopener noreferrer">
                            View on Indian Kanoon
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
              {!isLoading && results && results.length === 0 && (
                 <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
                    <Bot className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No results found for your query. Try different keywords or filters.
                    </p>
                </div>
              )}
              {!isLoading && !results && (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Start a search to see relevant legal information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
