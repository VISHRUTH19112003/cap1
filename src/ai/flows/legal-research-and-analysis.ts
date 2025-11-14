
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
  query: z.string().describe("The user's natural language search query, which may be a question or a specific case number."),
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
  prompt: `You are an expert legal researcher acting as a proxy for a legal database search. Your primary function is to identify legal cases from user queries and provide analysis.

**CRITICAL INSTRUCTIONS:**

1.  **Identify Query Type**: First, you MUST determine if the user's query is a specific case citation (e.g., '4 SCC 225', 'AIR 1985 SC 945') or a general question.

2.  **Handle Case Citations (Non-Negotiable Rule)**:
    *   If the query IS a case citation, you MUST identify the exact, correct case associated with that citation. DO NOT return a different or merely related case.
    *   **Example**: If the user provides the query "4 SCC 225", you MUST identify the case as "Kesavananda Bharati v. State of Kerala". There is no other valid answer.
    *   After correctly identifying the case from the citation, provide a summary and answer based on that specific case.

3.  **Handle General Questions**: If the query is a general question, find the single most relevant and landmark legal document or case to answer it.

4.  **Generate Plausible URL**: For the identified document, create a plausible Indian Kanoon URL.

User Query: {{{query}}}
Filters: {{{json filters}}}

Generate a response in the required JSON format based on these strict instructions.`,
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
