
import { AnalysisForm } from './analysis-form'

export default function ContractAnalysisPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Smart Contract Analysis</h1>
        <p className="mt-2 text-muted-foreground">
          Paste your contract text to identify key clauses, flag risks, and get suggested revisions.
        </p>
      </div>
      <AnalysisForm />
    </div>
  )
}
