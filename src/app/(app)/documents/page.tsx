'use client'

import * as React from 'react'
import { MoreHorizontal, PlusCircle, Upload } from 'lucide-react'

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

type Document = {
  name: string
  status: 'Analyzed' | 'Pending'
  date: string
  content: string
}

const initialDocuments: Document[] = [
  {
    name: 'Real Estate Lease Agreement.docx',
    status: 'Analyzed',
    date: '2023-06-23',
    content: `REAL ESTATE LEASE AGREEMENT
This Lease Agreement (the "Agreement") is made and entered into this 23rd day of June, 2023, by and between...`,
  },
  {
    name: 'Employment Contract - Senior Developer.pdf',
    status: 'Pending',
    date: '2023-06-24',
    content: `EMPLOYMENT CONTRACT
This Employment Contract is entered into by and between [Company Name] and [Employee Name]...`,
  },
  {
    name: 'Case Brief - Sharma v. Union.txt',
    status: 'Analyzed',
    date: '2023-06-25',
    content: `CASE BRIEF: Sharma v. Union of India
Citation: (2023) 5 SCC 123
Court: Supreme Court of India
Date: June 25, 2023
Facts: ...`,
  },
  {
    name: 'NDA for Project Alpha.docx',
    status: 'Pending',
    date: '2023-06-26',
    content: `NON-DISCLOSURE AGREEMENT
This Non-Disclosure Agreement ("Agreement") is effective as of June 26, 2023, between [Party A] and [Party B]...`,
  },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewingDoc, setPreviewingDoc] = React.useState<Document | null>(
    null
  )
  const { toast } = useToast()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      const newDocument: Document = {
        name: selectedFile.name,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        content: `Content of ${selectedFile.name}`,
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
                {documents.map((doc) => (
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
                          <DropdownMenuItem>Analyze</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{documents.length}</strong> of{' '}
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
             <pre className="whitespace-pre-wrap font-sans text-sm">
              {previewingDoc?.content}
             </pre>
          </ScrollArea>
          <DialogFooter>
             <Button variant="outline" onClick={() => setPreviewingDoc(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
