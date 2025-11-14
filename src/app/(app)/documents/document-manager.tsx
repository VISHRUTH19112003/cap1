
'use client'

import * as React from 'react';
import { useUser, useFirestore, useStorage, addDocumentNonBlocking, deleteDocumentNonBlocking, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, doc, serverTimestamp, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  file: z.instanceof(FileList).refine(files => files?.length > 0, 'File is required.'),
});

interface Document {
  id: string;
  filename: string;
  uploadDate: Date;
  storagePath: string;
  userId: string;
}

export function DocumentManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const docsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'documents'), where('userId', '==', user.uid));
  }, [user, firestore]);
  
  const { data: documents, isLoading: isLoadingDocs } = useCollection<Document>(docsQuery);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication or database service not available.' });
      return;
    }
    const file = values.file[0];
    if (!file) return;

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
        
        addDocumentNonBlocking(collection(firestore, 'documents'), {
          userId: user.uid,
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
          storagePath: storagePath,
          downloadURL: downloadURL,
          uploadDate: serverTimestamp(),
        });

        toast({ title: 'Success', description: 'Document uploaded successfully.' });
        setIsUploading(false);
        form.reset({ file: undefined });
      }
    );
  }

  async function handleDelete(docToDelete: Document) {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error', description: 'Authentication or database service not available.' });
      return;
    }

    const docRef = doc(firestore, 'documents', docToDelete.id);
    const storageRef = ref(storage, docToDelete.storagePath);

    try {
      await deleteObject(storageRef);
      deleteDocumentNonBlocking(docRef);
      toast({ title: 'Success', description: `${docToDelete.filename} has been deleted.` });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the document. It may have already been deleted.' });
    }
  }


  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
          <CardDescription>Select a file to upload.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document File</FormLabel>
                    <FormControl>
                      <Input type="file" {...form.register('file')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isUploading && <Progress value={uploadProgress} className="w-full" />}
              <Button type="submit" disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>My Documents</CardTitle>
          <CardDescription>View and manage your uploaded documents.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingDocs ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : documents && documents.length > 0 ? (
            <ul className="space-y-3">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{doc.filename}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-10">No documents uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    