import type { ExporterPluginV1 } from "../sdk/types";

interface GDocsOptions {
  accessToken: string;
  title?: string;
}

export const publisherGDocs: ExporterPluginV1 = {
  id: "publisher-gdocs",
  name: "Google Docs",
  version: "1.0.0",
  coreApiVersion: "1.x",
  type: "publish",
  permissionsNeeded: ["identity", "https://www.googleapis.com/*"],
  settingsSchema: {
    type: "object",
    properties: {
      accessToken: { type: "string", title: "OAuth Access Token" },
      title: { type: "string", title: "Document Title" }
    },
    required: ["accessToken"]
  },
  async render(ccd, options) {
    const { accessToken, title } = options as unknown as GDocsOptions;
    if (!accessToken) throw new Error("Google Docs access token is required.");

    const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title: title || ccd.meta.title })
    });
    const created = await createRes.json();
    const content = ccd.messages
      .map((m) => `${m.role.toUpperCase()}\n${m.blocks.map((b) => ("text" in b ? b.text : b.type)).join("\n")}`)
      .join("\n\n");

    await fetch(`https://docs.googleapis.com/v1/documents/${created.documentId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: `${content}\n`
            }
          }
        ]
      })
    });

    return {
      kind: "publish",
      publishResult: {
        id: created.documentId,
        displayUrl: `https://docs.google.com/document/d/${created.documentId}/edit`
      }
    };
  }
};
