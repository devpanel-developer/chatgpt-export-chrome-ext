import type { ExporterPluginV1 } from "../sdk/types";
import { exporterJson } from "./exporter-json";
import { exporterMarkdown } from "./exporter-markdown";
import { publisherGDocs } from "./publisher-gdocs";

export const builtInModules: ExporterPluginV1[] = [exporterJson, exporterMarkdown, publisherGDocs];

export function getModuleById(id: string): ExporterPluginV1 | undefined {
  return builtInModules.find((module) => module.id === id);
}
