
'use client'

import * as React from 'react'
import { generateLegalArgument } from '@/ai/flows/generate-legal-argument'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Sparkles, Upload, Download, File as FileIcon, X, Eye } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'


const formSchema = z.object({
  prompt: z.string().optional(),
});

export function ArgumentForm() {
  const [generatedArgument, setGeneratedArgument] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadedFile, setUploadedFile] = React.useState<{name: string, dataUri: string} | null>(null);
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
     if (!values.prompt && !uploadedFile) {
        toast({
            variant: 'destructive',
            title: 'Input Missing',
            description: 'Please either enter a prompt or upload a document for context.',
        });
        return;
    }
    setIsLoading(true)
    setGeneratedArgument(null)
    try {
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
          form.setValue('prompt', text);
          toast({
            title: 'File Content Loaded',
            description: `Content from ${file.name} has been loaded into the prompt area.`,
          });
        }
        textReader.readAsText(file);
      } else {
        form.setValue('prompt', '');
        toast({
          title: 'File Ready for Context',
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

  const handleRemoveFile = () => {
    setUploadedFile(null);
    form.setValue('prompt', '');
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Generate Legal Argument</CardTitle>
            <CardDescription>
              Describe a legal situation or upload a document to provide context.
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
                 {uploadedFile && (
                  <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm">
                    <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="flex-1 font-medium truncate" title={uploadedFile.name}>{uploadedFile.name}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                      <Link href={uploadedFile.dataUri} target="_blank" rel="noopener noreferrer">
                         <Eye />
                         <span className="sr-only">View File</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
                        <X/>
                        <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                )}
                 <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.pdf,.doc,.docx" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="submit" disabled={isLoading} variant="default" className='bg-primary text-primary-foreground'>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Argument
                </Button>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload for Context
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
  )
}
