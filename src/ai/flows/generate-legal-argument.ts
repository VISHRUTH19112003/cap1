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

const GenerateLegalArgumentInputSchema = z.string().describe('A prompt describing the legal situation for which an argument is to be generated.');
export type GenerateLegalArgumentInput = z.infer<typeof GenerateLegalArgumentInputSchema>;

const GenerateLegalArgumentOutputSchema = z.string().describe('A structured legal argument citing relevant Indian legal authorities.');
export type GenerateLegalArgumentOutput = z.infer<typeof GenerateLegalArgumentOutputSchema>;

export async function generateLegalArgument(input: GenerateLegalArgumentInput): Promise<GenerateLegalArgumentOutput> {
  return generateLegalArgumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLegalArgumentPrompt',
  input: {schema: GenerateLegalArgumentInputSchema},
  output: {schema: GenerateLegalArgumentOutputSchema},
  prompt: `You are an AI legal assistant specializing in Indian law. Generate a structured legal argument based on the following prompt, citing relevant Indian legal authorities such as the Constitution of India, IPC, CrPC, CPC, Evidence Act, Contract Act, Companies Act, SEBI regulations, RBI circulars, and Supreme Court/High Court judgments.\n\nPrompt: {{{$input}}}`,
});

const generateLegalArgumentFlow = ai.defineFlow(
  {
    name: 'generateLegalArgumentFlow',
    inputSchema: GenerateLegalArgumentInputSchema,
    outputSchema: GenerateLegalArgumentOutputSchema,
  },
  async input => {
    const {text} = await prompt(input);
    return text!;
  }
);
