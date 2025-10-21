'use server';
/**
 * @fileOverview A Genkit flow for chatting about a legal document.
 *
 * - chatAboutLegalDocument - A function that takes a document context and a question and returns an answer.
 * - ChatAboutLegalDocumentInput - The input type for the chatAboutLegalDocument function.
 * - ChatAboutLegalDocumentOutput - The return type for the chatAboutLegalDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatAboutLegalDocumentInputSchema = z.object({
  title: z.string().describe('The title of the legal document.'),
  summary: z.string().describe('The summary of the legal document.'),
  question: z.string().describe("The user's question about the document."),
});
export type ChatAboutLegalDocumentInput = z.infer<typeof ChatAboutLegalDocumentInputSchema>;

const ChatAboutLegalDocumentOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type ChatAboutLegalDocumentOutput = z.infer<typeof ChatAboutLegalDocumentOutputSchema>;

export async function chatAboutLegalDocument(
  input: ChatAboutLegalDocumentInput
): Promise<ChatAboutLegalDocumentOutput> {
  return await chatAboutLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatAboutLegalDocumentPrompt',
  input: { schema: ChatAboutLegalDocumentInputSchema },
  output: { schema: ChatAboutLegalDocumentOutputSchema },
  prompt: `You are a helpful legal assistant. The user is asking a question about a specific legal document. Use the provided title and summary to answer their question.

Document Title: {{{title}}}
Document Summary: {{{summary}}}

User's Question: {{{question}}}

Answer the question concisely based on the provided context. If the answer cannot be found in the context, say "I cannot answer that based on the provided information."`,
});

const chatAboutLegalDocumentFlow = ai.defineFlow(
  {
    name: 'chatAboutLegalDocumentFlow',
    inputSchema: ChatAboutLegalDocumentInputSchema,
    outputSchema: ChatAboutLegalDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
