
'use client'

import * as React from 'react'
import { summarizeContractAndIdentifyRisks, type SummarizeContractAndIdentifyRisksOutput } from '@/ai/flows/summarize-contract-and-identify-risks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Sparkles, Download, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import * as pdfjs from 'pdfjs-dist';


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'

// Required for pdfjs-dist
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

const formSchema = z.object({
  contract: z.string().min(20, { message: 'Please enter at least 20 characters of contract text.' }),
});

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = React.useState<SummarizeContractAndIdentifyRisksOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setAnalysisResult(null)
    try {
      const result = await summarizeContractAndIdentifyRisks({
        contractText: values.contract,
      })
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
=======================

[Key Clause Summary]
--------------------
${analysisResult.summary}

[Risk & Revision Report]
--------------------------
${analysisResult.riskReport}
    `

    const blob = new Blob([reportContent.trim()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'analysis-report.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        form.setValue('contract', text);
        toast({
          title: 'File Content Loaded',
          description: `${file.name} content has been loaded into the text area.`,
        });
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          if (!arrayBuffer) return;
          
          const loadingTask = pdfjs.getDocument(arrayBuffer);
          const pdf = await loadingTask.promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
          }
          form.setValue('contract', fullText);
          toast({
            title: 'PDF Content Loaded',
            description: `${file.name} content has been extracted and loaded.`,
          });
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        toast({
          variant: 'destructive',
          title: 'PDF Parsing Failed',
          description: 'Could not extract text from the PDF file.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: 'Please upload a .txt or .pdf file.',
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Analyze a Contract</CardTitle>
          <CardDescription>
            Paste contract text or upload a document to begin the analysis.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="contract"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Contract Text</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                        </Button>
                        <FormControl>
                            <Input
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".txt,.pdf"
                            />
                        </FormControl>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your contract text here."
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
            <CardFooter className="flex justify-start">
               <Button type="submit" disabled={isLoading} variant="default">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Contract
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
