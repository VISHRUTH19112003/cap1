
'use client'

import * as React from 'react'
import { generateLegalArgument } from '@/ai/flows/generate-legal-argument'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Loader2, Sparkles, BookOpen } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUser, useFirestore, useStorage } from '@/firebase'
import { collection, query, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { ref, getBytes } from "firebase/storage";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const formSchema = z.object({
  prompt: z.string().min(20, {
    message: 'Prompt must be at least 20 characters.',
  }),
})

interface Document {
  id: string;
  filename: string;
  storagePath: string;
}

export function ArgumentForm() {
  const [generatedArgument, setGeneratedArgument] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const { user } = useUser()
  const firestore = useFirestore()
  const storage = useStorage()
  const [documents, setDocuments] = React.useState<Document[]>([])
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
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
    setGeneratedArgument(null)
    try {
      const result = await generateLegalArgument(values.prompt)
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
  
  const handleSelectDocument = async (docId: string) => {
    if (!docId || !user || !firestore || !storage) return;
    
    const docRef = doc(firestore, `users/${user.uid}/documents`, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const fileRef = ref(storage, docSnap.data().storagePath);
      try {
        const bytes = await getBytes(fileRef);
        const text = new TextDecoder().decode(bytes);
        const currentPrompt = form.getValues('prompt');
        form.setValue('prompt', `${currentPrompt}\n\n--- Document Content ---\n${text}`);
        toast({ title: 'Success', description: 'Document content appended to prompt.' });
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
            <CardTitle>Generate Legal Argument</CardTitle>
            <CardDescription>
              Describe a legal situation or select a document to provide context.
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                 <FormItem>
                   <FormLabel>Select a document for context</FormLabel>
                    <Select onValueChange={handleSelectDocument}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a document to append its content" />
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
      
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generated Argument</CardTitle>
          <CardDescription>
            The AI-generated legal argument will appear below.
          </CardDescription>
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
