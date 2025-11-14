
'use client'

import * as React from 'react'
import { generateLegalArgument } from '@/ai/flows/generate-legal-argument'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Sparkles, Download, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  prompt: z.string().min(10, { message: 'Please enter a prompt with at least 10 characters.' }),
});

export function ArgumentForm() {
  const [generatedArgument, setGeneratedArgument] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setGeneratedArgument(null)
    try {
      const result = await generateLegalArgument({
        prompt: values.prompt,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        form.setValue('prompt', text)
        toast({
          title: 'File Content Loaded',
          description: `${file.name} content has been loaded into the text area.`,
        })
      }
      reader.readAsText(file)
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: 'Please upload a .txt file.',
      })
    }
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = ''
    }
  }


  return (
    <div className="grid grid-cols-1 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Generate Legal Argument</CardTitle>
          <CardDescription>
            Describe a legal situation to generate a structured argument.
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
                    <div className="flex justify-between items-center">
                      <FormLabel>Legal Prompt</FormLabel>
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
                            accept=".txt"
                        />
                      </FormControl>
                    </div>
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
            </CardContent>
            <CardFooter className="flex justify-start">
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
