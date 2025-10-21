
'use client'

import * as React from 'react'
import { generateLegalArgument } from '@/ai/flows/generate-legal-argument'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Sparkles, FileText, Upload, PlusCircle, MoreHorizontal } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const formSchema = z.object({
  prompt: z.string().min(20, {
    message: 'Prompt must be at least 20 characters.',
  }),
  documentContext: z.string().optional(),
})

type Document = {
  name: string
  date: string
  content: string
}

export function ArgumentForm() {
  const [generatedArgument, setGeneratedArgument] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const [documents, setDocuments] = React.useState<Document[]>([])
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [selectedDocument, setSelectedDocument] = React.useState<Document | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      documentContext: '',
    },
  })

  React.useEffect(() => {
    if (selectedDocument) {
      form.setValue('documentContext', `Document Context: ${selectedDocument.name}\n\n${selectedDocument.content}`)
    } else {
      form.setValue('documentContext', '')
    }
  }, [selectedDocument, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setGeneratedArgument(null)
    try {
      const finalPrompt = values.documentContext ? `${values.documentContext}\n\nUser Prompt: ${values.prompt}` : values.prompt;
      const result = await generateLegalArgument(finalPrompt)
      setGeneratedArgument(result)
    } catch (error) {
      console.error('Error generating argument:', error)
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
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
    <>
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Legal Argument</CardTitle>
            <CardDescription>
              Describe a legal situation or select an uploaded document to generate a structured argument.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Argue for bail in a case of alleged theft where the evidence is purely circumstantial..."
                          className="min-h-[150px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {selectedDocument && (
                  <div className="mt-4 rounded-md border bg-muted/50 p-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      Context: <span className="font-bold text-foreground">{selectedDocument.name}</span>
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading} variant="default" className='bg-primary text-primary-foreground'>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Argument
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Documents</CardTitle>
                <CardDescription>Select a document to add it as context.</CardDescription>
              </div>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload
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
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead><span className="sr-only">Action</span></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length > 0 ? documents.map((doc) => (
                      <TableRow key={doc.name} className={cn("cursor-pointer", selectedDocument?.name === doc.name && "bg-muted/50")}>
                        <TableCell className="font-medium" onClick={() => setSelectedDocument(doc)}>{doc.name}</TableCell>
                        <TableCell onClick={() => setSelectedDocument(doc)}>{doc.date}</TableCell>
                        <TableCell>
                          <Button 
                            variant={selectedDocument?.name === doc.name ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedDocument(doc.name === selectedDocument?.name ? null : doc)}
                          >
                           {selectedDocument?.name === doc.name ? 'Deselect' : 'Select'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">No documents uploaded.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
      </div>
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Argument</CardTitle>
          <CardDescription>
            The AI-generated legal argument will appear below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          )}
          {generatedArgument ? (
            <ScrollArea className="h-full">
            <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/30 p-4">
              <pre className="whitespace-pre-wrap font-sans">{generatedArgument}</pre>
            </div>
            </ScrollArea>
          ) : (
            !isLoading && (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Your argument awaits generation.
                </p>
            </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
    </>
  )
}
