# Clarity — AI Research Studio

A clean React research assistant starter with a softly lit Three.js centerpiece, document Q&A, optional live web search, and a small Express API. Customize the name, colors, prompts, and model settings to make the workspace your own.

## Run locally

1. Install Node.js 20 or newer.
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` and add an API key for your chosen OpenAI-compatible provider. The default configuration uses OpenAI.
4. Optionally add a Tavily key to enable live web search. Without it, the assistant still answers from its model knowledge and uploaded files, but cannot verify current events online.
5. Run `npm run dev` and open the local address printed by Vite.

To create a production build, run `npm run build`, then `npm start`. Configure your hosting provider to supply the environment variables. Never put provider keys in React code or commit `.env`.

## What it supports

- Ask general questions and follow up in a conversation.
- Upload PDF, DOCX, TXT, Markdown, CSV, and JSON files; up to eight files at 15 MB each.
- Toggle optional Tavily web search for questions that need recent information. The assistant receives search snippets and is instructed to cite the result links.
- Responsive React interface with an animated, procedural Three.js glass-stone form.

## Privacy and limitations

This starter does not save chats or uploaded files to a database. Files are held in browser memory for the session and their extracted text is sent to the configured model provider with each question. When Tavily is enabled, the latest question is sent to Tavily for search. Review those providers' terms and privacy practices before using sensitive information. Server logs report errors, and the application is not a substitute for a secured, access-controlled deployment.

The assistant can be wrong. Live search depends on a valid Tavily key and network access; it is optional and not guaranteed to find every current fact. Tableau is not connected in this starter. CSV files can be uploaded as context, but Tableau workbooks and Tableau Server are not queried. Add a Tableau integration separately using credentials stored only on the server.

The app intentionally contains no author identity or ownership assertion. Replace the Clarity product name and design details as desired, and follow the licenses and attribution requirements of the libraries and service providers you use.

## Project structure

```text
src/                 React interface and 3D centerpiece
server/index.ts      Upload extraction, model, and optional search APIs
.env.example         Server configuration template
```

## Configuration

| Variable | Required | Description |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side model API key |
| `OPENAI_BASE_URL` | No | OpenAI-compatible API base URL |
| `OPENAI_MODEL` | No | Model name (defaults to `gpt-4o-mini`) |
| `TAVILY_API_KEY` | No | Enables current web search |
| `PORT` | No | API server port (defaults to `8787`) |
