
'use client'

import * as React from 'react'
import { summarizeContractAndIdentifyRisks, type SummarizeContractAndIdentifyRisksOutput } from '@/ai/flows/summarize-contract-and-identify-risks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Download, Upload, File as FileIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'


const formSchema = z.object({
  contract: z.string().optional(),
});

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = React.useState<SummarizeContractAndIdentifyRisksOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<{name: string, dataUri: string} | null>(null);

  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.contract && !uploadedFile) {
        toast({
            variant: 'destructive',
            title: 'Input Missing',
            description: 'Please either paste the contract text or upload a document.',
        });
        return;
    }

    setIsLoading(true)
    setAnalysisResult(null)
    try {
      const result = await summarizeContractAndIdentifyRisks({
        contractText: values.contract,
        contractDataUri: uploadedFile?.dataUri
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setUploadedFile({ name: file.name, dataUri });
      
      if (file.type === 'text/plain') {
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const text = e.target?.result as string;
          form.setValue('contract', text);
          toast({
            title: 'File Content Loaded',
            description: `${file.name} content has been loaded into the text area.`,
          });
        }
        textReader.readAsText(file);
      } else {
        form.setValue('contract', ''); // Clear textarea for non-text files
        toast({
          title: 'File Ready for Analysis',
          description: `${file.name} is ready. Its content won't be displayed but will be used by the AI.`,
        });
      }
    };
    reader.onerror = () => {
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    }
    reader.readAsDataURL(file);
  };


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                      <FormLabel>Contract Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your contract text here, or upload a document below."
                          className="min-h-[400px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {uploadedFile && (
                  <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 font-medium truncate">{uploadedFile.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                        setUploadedFile(null);
                        form.setValue('contract', '');
                        if(fileInputRef.current) fileInputRef.current.value = '';
                    }}>
                        <span className="sr-only">Remove file</span>
                        &times;
                    </Button>
                  </div>
                )}
                <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.doc,.docx" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
              </Button>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                 <Upload className="mr-2 h-4 w-4" />
                 Upload Document
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
