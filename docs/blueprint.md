# **App Name**: NyayaGPT

## Core Features:

- Secure Authentication: User authentication with JWT, login, signup, and forgot password functionalities. Access token and refresh token rotation.
- Document Management: Users can upload legal documents (PDF, DOCX, TXT) and view, preview, and delete them. Documents are parsed, preprocessed, embedded, and indexed in FAISS for semantic search.
- AI-Powered Legal Search (Indian Law): Allows users to search legal documents using natural language. Results are filtered to Indian law only. Strict enforcement using document jurisdiction and legal taxonomy.
- AI-Driven Argument Generation: Users can input a prompt, and the tool generates structured legal arguments citing relevant Indian authorities. Authorities include: Constitution of India, IPC, CrPC, CPC, Evidence Act, Contract Act, Companies Act, SEBI regs, RBI circulars, Supreme Court/High Court judgments. The system is a tool, in that the LLM reasons about when to use the listed authorities.
- Smart Contract Analysis: Tool analyzes legal contracts uploaded as documents or pasted as raw text. It extracts key clauses, flags risky or missing clauses, and provides a risk report with suggested revisions.
- Profile Management: Users can manage their profile details, switch between linked accounts, and toggle light/dark mode.
- Settings Management: Users can configure various application settings such as default page, language, AI model parameters, and privacy options. Settings are persisted to the backend.

## Style Guidelines:

- Primary color: Black (#000000) for conveying trust, authority, and legal expertise.
- Background color: Light gray (#F0F0F0) to provide a clean, professional backdrop for content display.
- Accent color: Gold (#FFD700) to highlight important information and call-to-action elements, giving a sophisticated feel.
- Headline font: 'Playfair', serif, for headlines, with a fashionable, high-end feel. Body font: 'PT Sans', sans-serif, for longer text. These are suited for combining as headlines and body copy.
- Code font: 'Source Code Pro' for displaying code snippets.
- Use a consistent set of professional icons. Legal-themed icons will be used where appropriate, such as scales, gavels, and documents. Follow the Lucide icon set.
- Maintain a clean and structured layout with clear sections and spacing. Prioritize important content and functionalities.