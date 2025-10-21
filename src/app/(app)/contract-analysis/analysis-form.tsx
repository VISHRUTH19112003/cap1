
'use client'

import * as React from 'react'
import { summarizeContractAndIdentifyRisks, type SummarizeContractAndIdentifyRisksOutput } from '@/ai/flows/summarize-contract-and-identify-risks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Download, Upload, PlusCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  contract: z.string().min(100, {
    message: 'Contract text must be at least 100 characters.',
  }),
})

type Document = {
  name: string
  date: string
  content: string
}

export function AnalysisForm() {
  const [analysisResult, setAnalysisResult] = React.useState<SummarizeContractAndIdentifyRisksOutput | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const [activeTab, setActiveTab] = React.useState('text')
  
  const [documents, setDocuments] = React.useState<Document[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null)

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
  
  const handleAnalyzeSelectedDoc = () => {
    if (selectedDocument) {
      form.setValue('contract', selectedDocument.content)
      onSubmit({ contract: selectedDocument.content })
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSelectedFile(file);
        (file as any)._content = content;
      };
      reader.readAsText(file);
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      const newDocument: Document = {
        name: selectedFile.name,
        date: new Date().toISOString().split('T')[0],
        content: (selectedFile as any)._content || `Content of ${selectedFile.name}`,
      }
      setDocuments((prevDocs) => [newDocument, ...prevDocs])
      toast({
        title: 'File Uploaded',
        description: `${selectedFile.name} has been successfully uploaded.`,
      })
      setSelectedFile(null)
      setIsUploadDialogOpen(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Analyze a Contract</CardTitle>
          <CardDescription>
            Paste contract text or select an uploaded document to begin the analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Paste Text</TabsTrigger>
              <TabsTrigger value="document">Select Document</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="contract"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="sr-only">Contract Text</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste your contract text here..."
                            className="min-h-[300px] resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CardFooter className="px-0 pt-6">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Analyze Text
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="document" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Select a document to analyze.</p>
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Upload New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                      <DialogDescription>Select a document from your device.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="document">Document</Label>
                        <Input id="document" type="file" onChange={handleFileChange} />
                        {selectedFile && <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleUpload}><Upload className="mr-2 h-4 w-4" /> Upload</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
                <Card>
                  <ScrollArea className="h-72">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.length > 0 ? (
                          documents.map((doc) => (
                            <TableRow 
                              key={doc.name} 
                              onClick={() => setSelectedDocument(doc)}
                              className={cn("cursor-pointer", selectedDocument?.name === doc.name && "bg-muted/50")}
                            >
                              <TableCell className="font-medium">{doc.name}</TableCell>
                              <TableCell>{doc.date}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="h-24 text-center">
                              No documents uploaded.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </Card>
                <Button onClick={handleAnalyzeSelectedDoc} disabled={!selectedDocument || isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze Selected Document
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
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
            <div className="flex items-center justify-center p-16">
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
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
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
