export type CCDScope = "all" | "partial";

export interface CanonicalChatDocumentV1 {
  meta: {
    sourceApp: "chatgpt";
    url: string;
    title: string;
    capturedAtISO: string;
    selection: { scope: CCDScope; messageIds: string[] };
  };
  messages: CCDMessage[];
  assets: CCDAset[];
  annotations: {
    warnings: string[];
    redactions: string[];
  };
}

export interface CCDMessage {
  id: string;
  role: "user" | "assistant";
  createdAtISO?: string;
  blocks: CCDBlock[];
}

export type CCDBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: number; text: string }
  | { type: "code"; lang?: string; text: string }
  | { type: "table"; rows: string[][] }
  | { type: "math"; latex: string }
  | { type: "image"; assetId: string; alt?: string; caption?: string }
  | { type: "quote"; text: string };

export interface CCDAset {
  assetId: string;
  mime: string;
  filename?: string;
  bytesBase64?: string;
  blobUrl?: string;
  sourceUrl?: string;
  sha256?: string;
}

export interface ExportResult {
  kind: "download" | "openTab" | "clipboard" | "publish";
  filename?: string;
  mime?: string;
  bytesBase64?: string;
  text?: string;
  openUrl?: string;
  publishResult?: {
    id?: string;
    displayUrl?: string;
  };
}

export interface CoreContextV1 {
  localOnlyMode: boolean;
}

export interface ExporterPluginV1 {
  id: string;
  name: string;
  version: string;
  coreApiVersion: "1.x";
  type: "export" | "publish" | "transform";
  permissionsNeeded: string[];
  settingsSchema?: object;
  validate?: (
    ccd: CanonicalChatDocumentV1
  ) => { warnings: string[]; errors: string[] };
  render: (
    ccd: CanonicalChatDocumentV1,
    options: Record<string, unknown>,
    coreContext: CoreContextV1
  ) => Promise<ExportResult>;
}
