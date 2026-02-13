import type { ExporterPluginV1 } from "../../src/sdk/types";

export const moduleTemplate: ExporterPluginV1 = {
  id: "module-template",
  name: "Module Template",
  version: "0.0.1",
  coreApiVersion: "1.x",
  type: "export",
  permissionsNeeded: ["downloads"],
  async render() {
    return {
      kind: "download",
      filename: "template.txt",
      mime: "text/plain",
      text: "implement render()"
    };
  }
};
