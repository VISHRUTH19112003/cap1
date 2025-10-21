'use server';
/**
 * @fileOverview A Genkit flow for summarizing a legal document.
 *
 * - summarizeLegalDocument - A function that takes a document context and returns a summary.
 * - SummarizeLegalDocumentInput - The input type for the summarizeLegalDocument function.
 * - SummarizeLegalDocumentOutput - The return type for the summarizeLegalDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeLegalDocumentInputSchema = z.object({
  title: z.string().describe('The title of the legal document.'),
  snippet: z.string().describe('A snippet from the legal document.'),
  url: z.string().url().describe('The URL of the full legal document.'),
});
export type SummarizeLegalDocumentInput = z.infer<typeof SummarizeLegalDocumentInputSchema>;

const SummarizeLegalDocumentOutputSchema = z.object({
  summary: z.string().describe('A detailed summary of the legal document.'),
});
export type SummarizeLegalDocumentOutput = z.infer<typeof SummarizeLegalDocumentOutputSchema>;

export async function summarizeLegalDocument(
  input: SummarizeLegalDocumentInput
): Promise<SummarizeLegalDocumentOutput> {
  return await summarizeLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLegalDocumentPrompt',
  input: { schema: SummarizeLegalDocumentInputSchema },
  output: { schema: SummarizeLegalDocumentOutputSchema },
  prompt: `You are an expert legal analyst. Based on the title and snippet of the following legal document, generate a concise summary of the key points. Pretend you have read the full document at the provided URL.

Title: {{{title}}}
Snippet: {{{snippet}}}
URL: {{{url}}}

Generate a summary that is about 3-4 paragraphs long.`,
});

const summarizeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeLegalDocumentFlow',
    inputSchema: SummarizeLegalDocumentInputSchema,
    outputSchema: SummarizeLegalDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
