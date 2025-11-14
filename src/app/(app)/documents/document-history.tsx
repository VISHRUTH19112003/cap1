
'use client';

import * as React from 'react';
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Loader2, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Document {
  id: string;
  filename: string;
  downloadURL: string;
  contentType: string;
  uploadDate: {
    seconds: number;
    nanoseconds: number;
  }
}

interface DocumentHistoryProps {
  onFileSelect: (file: { id: string; filename: string; downloadURL: string }) => void;
}

export function DocumentHistory({ onFileSelect }: DocumentHistoryProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const docsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'documents'), 
      where('userId', '==', user.uid),
      orderBy('uploadDate', 'desc')
    );
  }, [user, firestore]);
  
  const { data: documents, isLoading: isLoadingDocs } = useCollection<Document>(docsQuery);
  const [selectedFileId, setSelectedFileId] = React.useState<string | null>(null);

  const handleUseFile = (doc: Document) => {
    onFileSelect({ id: doc.id, filename: doc.filename, downloadURL: doc.downloadURL });
    setSelectedFileId(doc.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document History</CardTitle>
        <CardDescription>Use a previously uploaded document.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingDocs ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : documents && documents.length > 0 ? (
          <ScrollArea className="h-96">
            <ul className="space-y-3">
              {documents.map(doc => (
                <li key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[200px]">{doc.filename}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUseFile(doc)} disabled={selectedFileId === doc.id}>
                    {selectedFileId === doc.id ? <Check className="mr-2 h-4 w-4" /> : null}
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="text-center text-muted-foreground py-10">No documents uploaded yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

    