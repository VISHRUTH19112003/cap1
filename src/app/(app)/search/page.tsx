
'use client';

import * as React from 'react';
import {
  legalResearchAndAnalysis,
  type LegalResearchAndAnalysisInput,
  type LegalResearchAndAnalysisOutput,
} from '@/ai/flows/legal-research-and-analysis';
import {
  chatAboutLegalDocument,
  type ChatAboutLegalDocumentInput,
} from '@/ai/flows/chat-about-legal-document';
import {
  Bot,
  ExternalLink,
  Loader2,
  Send,
  Search as SearchIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function LegalSearchPage() {
  const [query, setQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<LegalResearchAndAnalysisOutput | null>(null);
  const { toast } = useToast();

  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [chatQuery, setChatQuery] = React.useState('');
  const [isChatting, setIsChatting] = React.useState(false);

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
    setResult(null);
    setChatHistory([]);

    const searchInput: LegalResearchAndAnalysisInput = {
      query,
      filters: {},
    };

    try {
      const searchResult = await legalResearchAndAnalysis(searchInput);
      setResult(searchResult);
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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim() || !result) return;

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: chatQuery },
    ];
    setChatHistory(newHistory);
    const currentQuery = chatQuery;
    setChatQuery('');
    setIsChatting(true);

    try {
      const chatInput: ChatAboutLegalDocumentInput = {
        title: result.title,
        summary: result.summary,
        question: currentQuery,
      };
      const chatResponse = await chatAboutLegalDocument(chatInput);
      setChatHistory([
        ...newHistory,
        { role: 'assistant', content: chatResponse.answer },
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          AI-Powered Legal Research Assistant
        </h1>
        <p className="mt-2 text-muted-foreground">
          Ask a question about Indian law, and get a summarized answer with case details.
        </p>
      </div>
      
      <div className='space-y-6'>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="e.g., 'What was the judgment in the 26/11 terror attacks case?'"
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
              Ask
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          {isLoading && (
            <Card className="flex min-h-[400px] flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Researching...
              </p>
            </Card>
          )}
          {!isLoading && result && (
            <Card>
              <CardHeader>
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>
                  AI-generated analysis and summary based on your query.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <Accordion type="multiple" defaultValue={['summary', 'answer']} className="w-full">
                    <AccordionItem value="summary">
                      <AccordionTrigger className="text-lg font-headline">Case Summary</AccordionTrigger>
                      <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{result.summary}</pre>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="answer">
                      <AccordionTrigger className="text-lg font-headline">Answer to your Question</AccordionTrigger>
                      <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2">
                         <pre className="whitespace-pre-wrap font-sans text-sm">{result.answer}</pre>
                         {result.url && (
                           <Button variant="outline" size="sm" asChild className="mt-4">
                              <Link
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View Source
                                <ExternalLink className="ml-2 h-3 w-3" />
                              </Link>
                            </Button>
                         )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">Ask a follow-up question</h3>
                   <ScrollArea className="h-48 pr-4 mb-4 border rounded-md p-4">
                    <div className="space-y-4">
                      <div className='flex items-start gap-3'>
                         <Bot className="h-5 w-5 flex-shrink-0" />
                         <div className='bg-muted rounded-lg p-3 text-sm'>
                          <p>I have summarized the document and answered your question. Ask me anything else about it.</p>
                         </div>
                       </div>
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
                  <form onSubmit={handleChatSubmit} className="flex w-full gap-2">
                    <Input
                      placeholder="Ask anything about this case..."
                      value={chatQuery}
                      onChange={(e) => setChatQuery(e.target.value)}
                      disabled={isChatting || !result}
                    />
                    <Button type="submit" size="icon" disabled={isChatting || !result || !chatQuery.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

              </CardContent>
            </Card>
          )}
          {!isLoading && !result && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
              <Bot className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Ask a question to get started. Your detailed answer will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
