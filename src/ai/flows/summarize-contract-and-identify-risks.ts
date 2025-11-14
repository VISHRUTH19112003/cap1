'use server';
/**
 * @fileOverview Summarizes a legal contract, identifies risks and missing clauses, and suggests revisions.
 *
 * - summarizeContractAndIdentifyRisks - A function that handles the contract summarization and risk identification process.
 * - SummarizeContractAndIdentifyRisksInput - The input type for the summarizeContractAndIdentifyRisks function.
 * - SummarizeContractAndIdentifyRisksOutput - The return type for the summarizeContractAndIdentifyRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContractAndIdentifyRisksInputSchema = z.object({
  contractText: z.string().optional().describe('The legal contract to analyze as raw text.'),
  contractDataUri: z.string().optional().describe("A document to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type SummarizeContractAndIdentifyRisksInput = z.infer<typeof SummarizeContractAndIdentifyRisksInputSchema>;

const SummarizeContractAndIdentifyRisksOutputSchema = z.object({
  summary: z.string().describe('A summary of the key clauses in the contract.'),
  riskReport: z.string().describe('A report identifying potential risks and missing clauses, with suggested revisions.'),
});
export type SummarizeContractAndIdentifyRisksOutput = z.infer<typeof SummarizeContractAndIdentifyRisksOutputSchema>;

export async function summarizeContractAndIdentifyRisks(
  input: SummarizeContractAndIdentifyRisksInput
): Promise<SummarizeContractAndIdentifyRisksOutput> {
  return summarizeContractAndIdentifyRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContractAndIdentifyRisksPrompt',
  input: {schema: SummarizeContractAndIdentifyRisksInputSchema},
  output: {schema: SummarizeContractAndIdentifyRisksOutputSchema},
  prompt: `You are an expert legal analyst.

You will analyze the contract provided and summarize the key clauses, identify potential risks and missing clauses, and generate a risk report with suggested revisions.

{{#if contractDataUri}}
  Contract Document: {{media url=contractDataUri}}
{{/if}}

{{#if contractText}}
  Contract Text:
  {{{contractText}}}
{{/if}}
`,
});

const summarizeContractAndIdentifyRisksFlow = ai.defineFlow(
  {
    name: 'summarizeContractAndIdentifyRisksFlow',
    inputSchema: SummarizeContractAndIdentifyRisksInputSchema,
    outputSchema: SummarizeContractAndIdentifyRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
