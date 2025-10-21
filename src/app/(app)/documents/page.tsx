
import { DocumentManager } from './document-manager';

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
        <p className="mt-2 text-muted-foreground">
          Upload, view, and manage your legal documents.
        </p>
      </div>
      <DocumentManager />
    </div>
  )
}
