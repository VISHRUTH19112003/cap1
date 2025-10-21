
'use client'

import * as React from 'react'
import { summarizeContractAndIdentifyRisks, type SummarizeContractAndIdentifyRisksOutput } from '@/ai/flows/summarize-contract-and-identify-risks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Download, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useUser, useFirestore } from '@/firebase'
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { getStorage, ref, getBytes } from "firebase/storage";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const formSchema = z.object({
  contract: z.string().min(100, {
    message: 'Contract text must be at least 100 characters.',
  }),
})

interface Document {
  id: string;
  filename: string;
  storagePath: string;
}

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = React.useState<SummarizeContractAndIdentifyRisksOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const firestore = useFirestore()
  const [documents, setDocuments] = React.useState<Document[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract: '',
    },
  })

  React.useEffect(() => {
    if (!user || !firestore) return;
    const docsQuery = query(collection(firestore, `users/${user.uid}/documents`));
    const unsubscribe = onSnapshot(docsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
      setDocuments(docs);
    });
    return () => unsubscribe();
  }, [user, firestore]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setAnalysisResult(null)
    try {
      const result = await summarizeContractAndIdentifyRisks(values)
      setAnalysisResult(result)
    } catch (error) {
      console.error('Error analyzing contract:', error)
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!analysisResult) return

    const reportContent = `
NyayaGPT Analysis Report
[Key Clause Summary]
${analysisResult.summary}
---
[Risk & Revision Report]
${analysisResult.riskReport}
    `

    const blob = new Blob([reportContent.trim()], { type: 'text/plain;charset=utf-t' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'analysis-report.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  
  const handleSelectDocument = async (docId: string) => {
    if (!docId || !user || !firestore) return;
    
    const docRef = doc(firestore, `users/${user.uid}/documents`, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const storage = getStorage();
      const fileRef = ref(storage, docSnap.data().storagePath);
      try {
        const bytes = await getBytes(fileRef);
        const text = new TextDecoder().decode(bytes);
        form.setValue('contract', text);
        toast({ title: 'Success', description: 'Document content loaded.' });
      } catch (e: any) {
         console.error("Error fetching document content:", e);
         toast({ variant: 'destructive', title: 'Error', description: 'Could not load document content.' });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Analyze a Contract</CardTitle>
          <CardDescription>
            Paste contract text or select an uploaded document to begin the analysis.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="space-y-4">
                 <FormItem>
                   <FormLabel>Select an existing document</FormLabel>
                   <Select onValueChange={handleSelectDocument}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document to load its content" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {documents.map(doc => (
                          <SelectItem key={doc.id} value={doc.id}>{doc.filename}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </FormItem>
                <FormField
                  control={form.control}
                  name="contract"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your contract text here or select a document above."
                          className="min-h-[400px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Text
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Analysis Report</CardTitle>
            <CardDescription>
              The AI-generated summary and risk report will appear here.
            </CardDescription>
          </div>
          {analysisResult && (
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download Report</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          )}
          {analysisResult ? (
            <Accordion type="multiple" defaultValue={['summary', 'risk-report']} className="w-full">
              <AccordionItem value="summary">
                <AccordionTrigger className="text-lg font-headline">Key Clause Summary</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{analysisResult.summary}</pre>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="risk-report">
                <AccordionTrigger className="text-lg font-headline">Risk & Revision Report</AccordionTrigger>
                <AccordionContent className="prose prose-sm dark:prose-invert max-w-none pt-2">
                   <pre className="whitespace-pre-wrap font-sans text-sm">{analysisResult.riskReport}</pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ) : (
            !isLoading && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Your report is pending analysis.
                </p>
            </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
