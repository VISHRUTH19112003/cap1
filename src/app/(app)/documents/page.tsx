import { MoreHorizontal, PlusCircle } from 'lucide-react'

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const documents = [
  {
    name: 'Real Estate Lease Agreement.docx',
    status: 'Analyzed',
    date: '2023-06-23',
  },
  {
    name: 'Employment Contract - Senior Developer.pdf',
    status: 'Pending',
    date: '2023-06-24',
  },
  {
    name: 'Case Brief - Sharma v. Union.txt',
    status: 'Analyzed',
    date: '2023-06-25',
  },
  {
    name: 'NDA for Project Alpha.docx',
    status: 'Pending',
    date: '2023-06-26',
  },
]

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="mt-2 text-muted-foreground">
            Upload, view, and manage your legal documents.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
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
                      variant={doc.status === 'Analyzed' ? 'default' : 'secondary'}
                      className={doc.status === 'Analyzed' ? 'bg-green-600/20 text-green-700 dark:bg-green-700/30 dark:text-green-400' : ''}
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
                        <DropdownMenuItem>Preview</DropdownMenuItem>
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
            Showing <strong>1-4</strong> of <strong>4</strong> documents
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
