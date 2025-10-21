'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-contract-and-identify-risks.ts';
import '@/ai/flows/generate-legal-argument.ts';
import '@/ai/flows/legal-search.ts';
import '@/ai/flows/summarize-legal-document.ts';
import '@/ai/flows/chat-about-legal-document.ts';
