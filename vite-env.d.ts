// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NOTION_TOKEN: string
  readonly VITE_NOTION_DATABASE_ID: string
  readonly REACT_APP_NOTION_TOKEN: string
  readonly REACT_APP_NOTION_DATABASE_ID: string
  readonly API_KEY: string
  [key: string]: any
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
