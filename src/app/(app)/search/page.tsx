
'use client';

import * as React from 'react';
import {
  legalSearch,
  type LegalSearchInput,
  type LegalSearchOutput,
} from '@/ai/flows/legal-search';
import { chatAboutLegalDocument, type ChatAboutLegalDocumentInput } from '@/ai/flows/chat-about-legal-document';
import { summarizeLegalDocument } from '@/ai/flows/summarize-legal-document';
import { Bot, ExternalLink, Loader2, MessageSquare, Search as SearchIcon, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Skeleton } from '@/components/ui/skeleton';

type FilterId = 'ipc' | 'crpc' | 'cpc' | 'contract-act' | 'const';
type SearchResult = LegalSearchOutput[0];
type ChatMessage = { role: 'user' | 'assistant'; content: string };

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

  const [activeDoc, setActiveDoc] = React.useState<SearchResult | null>(null);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [summary, setSummary] = React.useState<string | null>(null);

  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [chatQuery, setChatQuery] = React.useState('');
  const [isChatting, setIsChatting] = React.useState(false);

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

  const handleOpenSummaryDialog = async (doc: SearchResult) => {
    setActiveDoc(doc);
    setIsSummarizing(true);
    setSummary(null);
    setChatHistory([]);
    try {
      const result = await summarizeLegalDocument(doc);
      setSummary(result.summary);
    } catch (error) {
      console.error('Error summarizing document:', error);
      toast({
        variant: 'destructive',
        title: 'Summarization Failed',
        description: 'Could not generate a summary for this document.',
      });
      closeDialog();
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !summary || !activeDoc) return;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: chatQuery },
    ];
    setChatHistory(newHistory);
    setChatQuery('');
    setIsChatting(true);

    try {
      const chatInput: ChatAboutLegalDocumentInput = {
        title: activeDoc.title,
        summary: summary,
        question: chatQuery,
      };
      const result = await chatAboutLegalDocument(chatInput);
      setChatHistory([
        ...newHistory,
        { role: 'assistant', content: result.answer },
      ]);
    } catch (error) {
      console.error('Error in chat:', error);
      setChatHistory([
        ...newHistory,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsChatting(false);
    }
  };
  
  const closeDialog = () => {
    setActiveDoc(null);
    setSummary(null);
    setIsSummarizing(false);
    setChatHistory([]);
    setChatQuery('');
  };

  return (
    <>
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
                  Relevant cases and statutes will appear here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && (
                  <div className="flex min-h-[400px] flex-col items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      Searching...
                    </p>
                  </div>
                )}
                {!isLoading && results && results.length > 0 && (
                  <div className="space-y-4">
                    {results.map((result) => (
                      <Alert key={result.docid}>
                        <div className="flex flex-col gap-4">
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
                            <AlertDescription className="mt-2 line-clamp-3">
                              {result.snippet}
                            </AlertDescription>
                          </div>
                          <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" asChild>
                              <Link
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View on Indian Kanoon
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Link>
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleOpenSummaryDialog(result)}
                            >
                              <MessageSquare className="mr-2 h-3 w-3" />
                              Summarize & Chat
                            </Button>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                )}
                {!isLoading && results && results.length === 0 && (
                  <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
                    <Bot className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">
                      No results found for your query. Try different keywords or
                      filters.
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
      <Dialog open={!!activeDoc} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{activeDoc?.title}</DialogTitle>
            <DialogDescription>
              AI-generated summary and chat about this document.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isSummarizing ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{summary}</pre>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48 pr-4">
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-3',
                          msg.role === 'user' ? 'justify-end' : ''
                        )}
                      >
                        {msg.role === 'assistant' && <Bot className="h-5 w-5 flex-shrink-0" />}
                        <div
                          className={cn(
                            'max-w-md rounded-lg p-3 text-sm',
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatting && (
                       <div className='flex items-start gap-3'>
                         <Bot className="h-5 w-5 flex-shrink-0" />
                         <div className='bg-muted rounded-lg p-3'>
                           <Loader2 className='h-5 w-5 animate-spin' />
                         </div>
                       </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleChatSubmit} className="flex w-full gap-2">
                  <Input
                    placeholder="Ask a follow-up question..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    disabled={isSummarizing || isChatting || !summary}
                  />
                  <Button type="submit" size="icon" disabled={isSummarizing || isChatting || !summary || !chatQuery.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
