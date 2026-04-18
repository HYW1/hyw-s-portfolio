# HEYIWEN | Experience Designer Portfolio

A minimalist portfolio built with **Vite + React**, using **Notion** as the CMS.

## Local development

```bash
npm install
npm run dev
```

## Deploy to Vercel (Notion data available)

This project now reads Notion data through a Vercel Serverless Function at `api/notion.ts`.
Your Notion token stays on the server side and is not exposed in the browser.

### Required environment variables (Vercel Project Settings)

```env
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# optional: profile page icon source
NOTION_PROFILE_PAGE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> Important: Share your Notion database/page with the integration connected to `NOTION_TOKEN`, otherwise the API will return permission errors.

## Notion database property mapping

Use these property names in your database:

- `Title` (title)
- `Summary` (rich text)
- `Date` (date)
- `Cover` (files)
- `Tags` (multi-select)
- `Featured` (checkbox, optional)

## Build

```bash
npm run build
```
