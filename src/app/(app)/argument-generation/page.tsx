
import { ArgumentForm } from './argument-form'

export default function ArgumentGenerationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Driven Argument Generation</h1>
        <p className="mt-2 text-muted-foreground">
          Craft structured legal arguments by providing a prompt with context.
        </p>
      </div>
      <ArgumentForm />
    </div>
  )
}
