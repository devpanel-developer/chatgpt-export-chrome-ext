import { describe, expect, test } from "vitest";
import { exporterMarkdown } from "../extension/src/modules/exporter-markdown";
import { smallFixture } from "../extension/src/sdk/fixtures";

describe("exporter-markdown", () => {
  test("renders heading and code", async () => {
    const result = await exporterMarkdown.render(smallFixture, {}, { localOnlyMode: false });
    expect(result.kind).toBe("download");
    expect(result.text).toContain("## ASSISTANT");
    expect(result.text).toContain("```ts");
  });
});
