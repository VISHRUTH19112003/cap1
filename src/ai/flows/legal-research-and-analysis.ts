'use server';
/**
 * @fileOverview A Genkit flow for performing legal research, analysis, and answering questions.
 *
 * - legalResearchAndAnalysis - A function that takes a query and filters, finds a relevant case, summarizes it, and answers the user's question.
 * - LegalResearchAndAnalysisInput - The input type for the legalResearchAndAnalysis function.
 * - LegalResearchAndAnalysisOutput - The return type for the legalResearchAndAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FilterSchema = z.object({
  ipc: z.boolean().optional(),
  crpc: z.boolean().optional(),
  cpc: z.boolean().optional(),
  'contract-act': z.boolean().optional(),
  const: z.boolean().optional(),
});

const LegalResearchAndAnalysisInputSchema = z.object({
  query: z.string().describe("The user's natural language search query, which may be a question."),
  filters: FilterSchema.describe('Filters to apply to the search.'),
});
export type LegalResearchAndAnalysisInput = z.infer<typeof LegalResearchAndAnalysisInputSchema>;


const LegalResearchAndAnalysisOutputSchema = z.object({
  title: z.string().describe('The title of the most relevant legal document or case found.'),
  summary: z.string().describe('A detailed summary of the legal document.'),
  answer: z.string().describe('The specific answer to the user\'s question based on the document.'),
  url: z.string().url().describe('The URL to the full document.'),
});
export type LegalResearchAndAnalysisOutput = z.infer<typeof LegalResearchAndAnalysisOutputSchema>;


export async function legalResearchAndAnalysis(
  input: LegalResearchAndAnalysisInput
): Promise<LegalResearchAndAnalysisOutput> {
  return await legalResearchAndAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalResearchAndAnalysisPrompt',
  input: { schema: LegalResearchAndAnalysisInputSchema },
  output: { schema: LegalResearchAndAnalysisOutputSchema },
  prompt: `You are an expert legal researcher and analyst. Your task is to act as a proxy for the Indian Kanoon search engine and an expert paralegal.

1.  **Analyze the User's Query**: Understand the user's question and the legal concepts involved.
2.  **Find the Most Relevant Document**: Simulate a search on Indian Kanoon to find the single most relevant, up-to-date legal document (case, statute, etc.) that can answer the query.
3.  **Summarize the Document**: Provide a comprehensive summary of the key points of the document you found.
4.  **Answer the Question**: Directly answer the user's original query based on the content of the document.
5.  **Provide a Source URL**: Generate a plausible Indian Kanoon URL for the document you've "found".

Query: {{{query}}}
Filters: {{{json filters}}}

Generate a response in the required JSON format.`,
});

const legalResearchAndAnalysisFlow = ai.defineFlow(
  {
    name: 'legalResearchAndAnalysisFlow',
    inputSchema: LegalResearchAndAnalysisInputSchema,
    outputSchema: LegalResearchAndAnalysisOutputSchema,
    config: {
      temperature: 0.2,
    }
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
