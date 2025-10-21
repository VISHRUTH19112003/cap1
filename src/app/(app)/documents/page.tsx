
'use client'

import * as React from 'react'
import { MoreHorizontal, PlusCircle, Upload, Loader2, Bot, Download } from 'lucide-react'
import { summarizeContractAndIdentifyRisks, type SummarizeContractAndIdentifyRisksOutput } from '@/ai/flows/summarize-contract-and-identify-risks'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type Document = {
  name: string
  status: 'Analyzed' | 'Pending'
  date: string
  content: string
}

const initialDocuments: Document[] = []

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewingDoc, setPreviewingDoc] = React.useState<Document | null>(null)
  const [analyzingDoc, setAnalyzingDoc] = React.useState<Document | null>(null)
  const [analysisResult, setAnalysisResult] = React.useState<SummarizeContractAndIdentifyRisksOutput | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSelectedFile(file);
        // This is a mock; in a real app you'd likely not store file content in the component this way
        // But for the sake of this example, we'll attach it to the file object.
        (file as any)._content = content;
      };
      reader.readAsText(file);
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      const newDocument: Document = {
        name: selectedFile.name,
        status: 'Pending',
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
    } else {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a file to upload.',
      })
    }
  }

  const handlePreview = (doc: Document) => {
    setPreviewingDoc(doc)
  }

  const handleAnalyze = async (doc: Document) => {
    setAnalyzingDoc(doc)
    setIsAnalyzing(true)
    setAnalysisResult(null)
    try {
      const result = await summarizeContractAndIdentifyRisks({ contract: doc.content })
      setAnalysisResult(result)
      setDocuments(docs => docs.map(d => d.name === doc.name ? { ...d, status: 'Analyzed' } : d))
    } catch (error) {
      console.error('Error analyzing document:', error)
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An unexpected error occurred during analysis.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownload = () => {
    if (!analysisResult || !analyzingDoc) return

    const reportContent = `
# NyayaGPT Analysis Report for ${analyzingDoc.name}

## 1. Key Clause Summary
${analysisResult.summary}

---

## 2. Risk & Revision Report
${analysisResult.riskReport}
    `

    const blob = new Blob([reportContent.trim()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${analyzingDoc.name.split('.')[0]}-analysis-report.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const closeAnalysisDialog = () => {
    setAnalyzingDoc(null)
    setAnalysisResult(null)
    setIsAnalyzing(false)
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Document Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Upload, view, and manage your legal documents.
            </p>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>
                  Select a document from your device to upload for analysis.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="document">Document</Label>
                  <div className="relative">
                    <Input
                      id="document"
                      type="file"
                      className="cursor-pointer"
                      onChange={handleFileChange}
                    />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload}>
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
            <CardDescription>
              A list of all your uploaded legal documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Upload Date
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <TableRow key={doc.name}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.status === 'Analyzed' ? 'default' : 'secondary'
                          }
                          className={
                            doc.status === 'Analyzed'
                              ? 'bg-green-600/20 text-green-700 dark:bg-green-700/30 dark:text-green-400'
                              : ''
                          }
                        >
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doc.date}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handlePreview(doc)}>
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAnalyze(doc)}>Analyze</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{documents.length}</strong> of{' '}
              <strong>{documents.length}</strong> documents
            </div>
          </CardFooter>
        </Card>
      </div>
      <Dialog open={!!previewingDoc} onOpenChange={(isOpen) => !isOpen && setPreviewingDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewingDoc?.name}</DialogTitle>
            <DialogDescription>
              Status: {previewingDoc?.status} | Uploaded: {previewingDoc?.date}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md border bg-muted/30 p-4">
             <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
              {previewingDoc?.content}
             </pre>
          </ScrollArea>
          <DialogFooter>
             <Button variant="outline" onClick={() => setPreviewingDoc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!analyzingDoc} onOpenChange={(isOpen) => !isOpen && closeAnalysisDialog()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex-row justify-between items-start">
            <div>
              <DialogTitle>Analysis Report: {analyzingDoc?.name}</DialogTitle>
              <DialogDescription>
                The AI-generated summary and risk report are below.
              </DialogDescription>
            </div>
            {analysisResult && (
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Download Report</span>
              </Button>
            )}
          </DialogHeader>
          <ScrollArea className="h-[60vh] rounded-md border p-4">
            {isAnalyzing && (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <p className="ml-4">Analyzing document...</p>
              </div>
            )}
            {analysisResult && !isAnalyzing ? (
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
              !isAnalyzing && (
                <div className="h-full flex-col items-center justify-center text-center">
                  <Bot className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Your report is pending analysis.
                  </p>
                </div>
              )
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={closeAnalysisDialog}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
