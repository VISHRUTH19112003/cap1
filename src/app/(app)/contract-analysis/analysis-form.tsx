
'use client'

import * as React from 'react'
import { summarizeContractAndIdentifyRisks, type SummarizeContractAndIdentifyRisksOutput } from '@/ai/flows/summarize-contract-and-identify-risks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Download, Paperclip, X, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  contract: z.string().min(10, { message: 'Contract text must be at least 10 characters.' }),
});

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = React.useState<SummarizeContractAndIdentifyRisksOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [dataUri, setDataUri] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract: '',
    },
  })
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadedFile(file)

    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        form.setValue('contract', text)
      }
      reader.readAsText(file)
    } else {
       toast({
          title: 'File ready for analysis',
          description: `"${file.name}" will be sent to the AI for processing. Its content will not be displayed in the text area.`,
        });
    }

    const readerForDataUri = new FileReader()
    readerForDataUri.onload = (e) => {
      setDataUri(e.target?.result as string)
    }
    readerForDataUri.readAsDataURL(file)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setAnalysisResult(null)
    try {
      const result = await summarizeContractAndIdentifyRisks({
        contractText: values.contract,
        contractDataUri: dataUri || undefined,
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
  
  const handleRemoveFile = () => {
    setUploadedFile(null)
    setDataUri(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
                          placeholder="Paste your contract text here."
                          className="min-h-[400px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormItem>
                  <FormLabel>Upload Document (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a .txt or .pdf file for analysis.
                  </FormDescription>
                </FormItem>
                {uploadedFile && (
                  <div className="flex items-center justify-between rounded-md border bg-muted/50 p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{uploadedFile.name}</span>
                    </div>
                     <div className='flex items-center gap-1'>
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(URL.createObjectURL(uploadedFile), '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemoveFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-start">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze
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
