
'use server';
/**
 * @fileOverview A Genkit flow for chatting about a legal document.
 *
 * - chatAboutLegalDocument - A function that takes a document context and a question and returns an answer.
 * - ChatAboutLegalDocumentInput - The input type for the chatAboutLegalDocument function.
 * - ChatAboutLegalDocumentOutput - The return type for the chatAboutLegal-document function.
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
  prompt: `You are a helpful and friendly legal assistant. You are chatting with a user about a specific legal document.

First, use the provided title and summary to answer their question about the document.

If the user's question is not about the document (e.g., a greeting like "hi" or a general question), then answer it as a general conversational AI.

If a document-related question cannot be answered from the provided context, say that the information is not in the document, but try to provide a helpful, general response if possible.

Document Title: {{{title}}}
Document Summary: {{{summary}}}

User's Question: {{{question}}}

Your Answer:`,
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
