'use server';
/**
 * @fileOverview A Genkit flow for performing legal research using a simulated Indian Kanoon search tool.
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

const indianKanoonSearchTool = ai.defineTool(
  {
    name: 'indianKanoonSearch',
    description:
      'Searches for relevant Indian legal documents, cases, and statutes based on a user query and filters. The tool should act as a legal researcher and return up-to-date, relevant documents from sources like Indian Kanoon.',
    inputSchema: LegalSearchInputSchema,
    outputSchema: LegalSearchOutputSchema,
  },
  async (input) => {
    // This is a powerful tool that leverages the model's knowledge.
    // The prompt for the tool is implicitly generated from the description and schemas.
    // The model will understand that it needs to find and return legal documents.
    // For a production app, you would add a real search implementation here.
    // For this prototype, we are relying on the model's ability to generate valid, representative search results.
    return []; // The model will generate the results, so we return an empty array.
  }
);

export async function legalSearch(
  input: LegalSearchInput
): Promise<LegalSearchOutput> {
  return await legalSearchFlow(input);
}

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
    const llmResponse = await ai.generate({
      prompt: `You are an expert legal researcher. Your task is to find relevant Indian legal documents based on the user's query and filters. Provide the results in the format expected by the indianKanoonSearchTool.

Query: "${input.query}"
Filters: ${JSON.stringify(input.filters)}`,
      tools: [indianKanoonSearchTool],
      toolChoice: 'required',
    });

    const toolRequest = llmResponse.toolRequest();
    if (!toolRequest) {
      return [];
    }
    
    // Because the tool is a mock, the model actually returns the results
    // in the `toolRequest.input` field.
    if (toolRequest.name === 'indianKanoonSearch' && toolRequest.input) {
       return (toolRequest.input as any).results as LegalSearchOutput;
    }

    const toolResponse = await toolRequest.run();
    
    return toolResponse ? (toolResponse as LegalSearchOutput) : [];
  }
);
