'use server';
/**
 * @fileOverview A Genkit flow for performing legal research by generating simulated search results.
 *
 * - legalSearch - A function that takes a query and filters and returns a list of legal documents.
 * - LegalSearchInput - The input type for the legalSearch function.
 * - LegalSearchOutput - The return type for the legalSearch function.
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

const LegalSearchInputSchema = z.object({
  query: z.string().describe("The user's natural language search query."),
  filters: FilterSchema.describe('Filters to apply to the search.'),
});
export type LegalSearchInput = z.infer<typeof LegalSearchInputSchema>;

const SearchResultSchema = z.object({
  docid: z.string().describe('A unique identifier for the document.'),
  title: z.string().describe('The title of the legal document or case.'),
  snippet: z
    .string()
    .describe('A brief summary or relevant snippet from the document.'),
  url: z.string().url().describe('The URL to the full document.'),
});

const LegalSearchOutputSchema = z.array(SearchResultSchema);
export type LegalSearchOutput = z.infer<typeof LegalSearchOutputSchema>;


export async function legalSearch(
  input: LegalSearchInput
): Promise<LegalSearchOutput> {
  return await legalSearchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'legalSearchPrompt',
  input: { schema: LegalSearchInputSchema },
  output: { schema: LegalSearchOutputSchema },
  prompt: `You are an expert legal researcher acting as a proxy for the Indian Kanoon search engine. Your task is to generate a list of relevant Indian legal documents based on the user's query and filters. Return up-to-date, relevant documents that look like they came from Indian Kanoon. Provide between 3 and 5 results.

Query: {{{query}}}
Filters: {{{json filters}}}`,
});

const legalSearchFlow = ai.defineFlow(
  {
    name: 'legalSearchFlow',
    inputSchema: LegalSearchInputSchema,
    outputSchema: LegalSearchOutputSchema,
    config: {
      temperature: 0.1,
    }
  },
  async (input) => {
    const { output } = await prompt(input);
    return output || [];
  }
);
