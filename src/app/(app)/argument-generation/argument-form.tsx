
'use client'

import * as React from 'react'
import { generateLegalArgument } from '@/ai/flows/generate-legal-argument'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Sparkles, Download, Paperclip, X, Eye, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DocumentHistory } from '../documents/document-history'
import { useUser, useFirestore, useStorage } from '@/firebase'
import { Progress } from '@/components/ui/progress'


const formSchema = z.object({
  prompt: z.string(),
});

export function ArgumentForm() {
  const [generatedArgument, setGeneratedArgument] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<{name: string, dataUri: string, blobUrl: string} | null>(null)
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useUser()
  const firestore = useFirestore()
  const storage = useStorage()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a .txt or .pdf file.',
        });
        return;
    }

    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication or database service not available.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const storagePath = `users/${user.uid}/documents/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        toast({ variant: 'destructive', title: 'Upload Failed', description: 'An error occurred during upload.' });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        await addDoc(collection(firestore, 'users', user.uid, 'documents'), {
          userId: user.uid,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          storagePath: storagePath,
          downloadURL: downloadURL,
          uploadDate: serverTimestamp(),
        });
        
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUri = e.target?.result as string;
            const blobUrl = URL.createObjectURL(file);
            setUploadedFile({ name: file.name, dataUri, blobUrl });

            if (file.type === 'text/plain') {
                const textReader = new FileReader();
                textReader.onload = (e) => {
                    form.setValue('prompt', e.target?.result as string);
                }
                textReader.readAsText(file);
            } else {
                 toast({
                    title: 'File ready for analysis',
                    description: `"${file.name}" will be sent to the AI. Its content will not be displayed here.`,
                });
            }
        };
        reader.readAsDataURL(file);
        
        toast({ title: 'Success', description: 'Document uploaded and ready to use.' });
      }
    );
  }

  const handleFileFromHistory = async (doc: {id: string, filename: string, downloadURL: string}) => {
     try {
      const response = await fetch(doc.downloadURL);
      if (!response.ok) {
        throw new Error('Failed to fetch file from storage.');
      }
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        const blobUrl = URL.createObjectURL(blob);
        setUploadedFile({ name: doc.filename, dataUri, blobUrl });
      };
      reader.readAsDataURL(blob);

      toast({
        title: 'Document Selected',
        description: `Using "${doc.filename}" from your history as context.`
      });

    } catch (error) {
      console.error('Error using file from history:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load the selected document from history.',
      });
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setGeneratedArgument(null)
    try {
      if (!values.prompt && !uploadedFile) {
        toast({
          variant: 'destructive',
          title: 'Input Required',
          description: 'Please provide a prompt or upload a document.',
        })
        setIsLoading(false);
        return;
      }

      const result = await generateLegalArgument({
        prompt: values.prompt,
        contextDataUri: uploadedFile?.dataUri,
      })
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

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const handleDownload = () => {
    if (!generatedArgument) return

    const blob = new Blob([generatedArgument], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'generated-argument.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Legal Argument</CardTitle>
            <CardDescription>
              Describe a legal situation or upload a document to generate a structured argument.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Argue for bail in a case of alleged theft where the evidence is purely circumstantial..."
                          className="min-h-[300px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormItem>
                  <FormLabel>Upload Document</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".txt,.pdf"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload a .txt or .pdf file for context. This will also save it to your Document History.
                  </FormDescription>
                </FormItem>
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-muted-foreground">Uploading file...</p>
                  </div>
                )}
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
                        onClick={() => window.open(uploadedFile.blobUrl, '_blank')}
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
              </CardContent>
              <CardFooter className="flex justify-start">
                <Button type="submit" disabled={isLoading || isUploading} variant="default" className='bg-primary text-primary-foreground'>
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

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Generated Argument</CardTitle>
              <CardDescription>
                The AI-generated legal argument will appear below.
              </CardDescription>
            </div>
            {generatedArgument && (
              <Button variant="outline" size="icon" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Download Argument</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading && (
              <div className="flex h-full items-center justify-center min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              </div>
            )}
            {generatedArgument ? (
              <ScrollArea className="h-full max-h-[400px]">
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-md border bg-muted/30 p-4">
                  <pre className="whitespace-pre-wrap font-sans">{generatedArgument}</pre>
                </div>
              </ScrollArea>
            ) : (
              !isLoading && (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed text-center">
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

      <DocumentHistory onFileSelect={handleFileFromHistory} />
    </div>
  )
}

    