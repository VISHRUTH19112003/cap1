import { Bot, Search as SearchIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export default function LegalSearchPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI-Powered Legal Search</h1>
        <p className="mt-2 text-muted-foreground">
          Search your legal documents using natural language, with a focus on Indian law.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select defaultValue="india">
                  <SelectTrigger id="jurisdiction">
                    <SelectValue placeholder="Select jurisdiction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="other" disabled>
                      Other (coming soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Legal Taxonomy</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ipc" />
                  <Label htmlFor="ipc" className="font-normal">IPC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="crpc" />
                  <Label htmlFor="crpc" className="font-normal">CrPC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="cpc" />
                  <Label htmlFor="cpc" className="font-normal">CPC</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="contract-act" />
                  <Label htmlFor="contract-act" className="font-normal">Contract Act</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="const" />
                  <Label htmlFor="const" className="font-normal">Constitution</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search with natural language... e.g., 'precedents for anticipatory bail in fraud cases'"
              className="w-full pl-10 text-base"
            />
            <Button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-9">
              Search
            </Button>
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Relevant clauses and documents will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center">
                <Bot className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  Start a search to see relevant legal information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
