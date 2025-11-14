'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating legal arguments based on a user-provided prompt, citing relevant Indian legal authorities.
 *
 * - generateLegalArgument - A function that takes a prompt and returns a structured legal argument.
 * - GenerateLegalArgumentInput - The input type for the generateLegalArgument function.
 * - GenerateLegalArgumentOutput - The return type for the generateLegalArgument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalArgumentInputSchema = z.object({
  prompt: z.string().optional().describe('A prompt describing the legal situation for which an argument is to be generated.'),
  contextDataUri: z.string().optional().describe("A document for context, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

export type GenerateLegalArgumentInput = z.infer<typeof GenerateLegalArgumentInputSchema>;

const GenerateLegalArgumentOutputSchema = z.object({
  argument: z.string().describe('A structured legal argument citing relevant Indian legal authorities.'),
});
export type GenerateLegalArgumentOutput = z.infer<typeof GenerateLegalArgumentOutputSchema>;

export async function generateLegalArgument(input: GenerateLegalArgumentInput): Promise<string> {
  const result = await generateLegalArgumentFlow(input);
  return result.argument;
}

const prompt = ai.definePrompt({
  name: 'generateLegalArgumentPrompt',
  input: {schema: GenerateLegalArgumentInputSchema},
  output: {schema: GenerateLegalArgumentOutputSchema},
  prompt: `You are an AI legal assistant specializing in Indian law. Generate a structured legal argument based on the following prompt and/or document, citing relevant Indian legal authorities such as the Constitution of India, IPC, CrPC, CPC, Evidence Act, Contract Act, Companies Act, SEBI regulations, RBI circulars, and Supreme Court/High Court judgments.

{{#if prompt}}
Prompt: {{{prompt}}}
{{/if}}

{{#if contextDataUri}}
Context Document: {{media url=contextDataUri}}
{{/if}}
`,
});

const generateLegalArgumentFlow = ai.defineFlow(
  {
    name: 'generateLegalArgumentFlow',
    inputSchema: GenerateLegalArgumentInputSchema,
    outputSchema: GenerateLegalArgumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
