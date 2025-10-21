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

// Mock search results - in a real application, this would be a database or API call.
const mockIndianKanoonDB = [
  {
    docid: '12345',
    title: 'State of Punjab vs. Baldev Singh (1999)',
    snippet:
      'Judgment on the procedural safeguards required under Section 50 of the Narcotic Drugs and Psychotropic Substances (NDPS) Act, 1985.',
    url: 'https://indiankanoon.org/doc/12345/',
    tags: ['crpc', 'ndps'],
  },
  {
    docid: '67890',
    title: 'Carlill vs. Carbolic Smoke Ball Company (1893)',
    snippet:
      'A landmark English contract law decision that held an advertisement can constitute a unilateral contract, which is binding on the party who makes it.',
    url: 'https://indiankanoon.org/doc/67890/',
    tags: ['contract-act'],
  },
  {
    docid: '11223',
    title: 'Kesavananda Bharati vs. State of Kerala (1973)',
    snippet:
      'This case established the "Basic Structure Doctrine" of the Indian Constitution, which rules that the Parliament cannot alter the "basic structure" of the Constitution.',
    url: 'https://indiankanoon.org/doc/11223/',
    tags: ['const'],
  },
  {
    docid: '44556',
    title: 'Lalman Shukla vs. Gauri Datt (1913)',
    snippet:
      'An important judgment on the concept of acceptance in contract law. The court held that knowledge and acceptance of a proposal are essential to form a valid contract.',
    url: 'https://indiankanoon.org/doc/44556/',
    tags: ['contract-act'],
  },
  {
    docid: '77889',
    title: 'Code of Criminal Procedure (CrPC), 1973 - Section 164',
    snippet: 'This section deals with the recording of confessions and statements by a Magistrate.',
    url: 'https://indiankanoon.org/doc/77889/',
    tags: ['crpc'],
  },
  {
    docid: '99001',
    title: 'Indian Penal Code (IPC), 1860 - Section 302',
    snippet: 'This section defines the punishment for murder, which is death or imprisonment for life, and also liability to fine.',
    url: 'https://indiankanoon.org/doc/99001/',
    tags: ['ipc'],
  },
];

const FilterSchema = z.object({
  ipc: z.boolean().optional(),
  crpc: z.boolean().optional(),
  cpc: z.boolean().optional(),
  'contract-act': z.boolean().optional(),
  const: z.boolean().optional(),
});

const LegalSearchInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query.'),
  filters: FilterSchema.describe('Filters to apply to the search.'),
});
export type LegalSearchInput = z.infer<typeof LegalSearchInputSchema>;

const SearchResultSchema = z.object({
  docid: z.string().describe('The unique identifier for the document.'),
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
    description: 'Searches the Indian Kanoon database for relevant legal documents, cases, and statutes.',
    inputSchema: LegalSearchInputSchema,
    outputSchema: LegalSearchOutputSchema,
  },
  async (input) => {
    console.log('Simulating search with input:', input);
    const query = input.query.toLowerCase();
    const activeFilters = Object.entries(input.filters)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const results = mockIndianKanoonDB.filter((doc) => {
      const matchesQuery =
        doc.title.toLowerCase().includes(query) ||
        doc.snippet.toLowerCase().includes(query);
      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.some((filter) => doc.tags.includes(filter));
      return matchesQuery && matchesFilters;
    });

    // In a real scenario, you might want the AI to rank or further process these results.
    // For this prototype, we return the filtered mock data directly.
    return results.slice(0, 5); // Limit to 5 results
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
  },
  async (input) => {
    const searchResult = await indianKanoonSearchTool(input);
    return searchResult || [];
  }
);
