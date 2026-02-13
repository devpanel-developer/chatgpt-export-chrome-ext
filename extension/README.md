# Chat Export Platform (MV3)

A modular Chrome extension that converts selected ChatGPT page content into a **Canonical Chat Document (CCD)** and runs pluggable modules.

## Implemented
- In-page selector UI with:
  - entire vs partial message selection
  - include user/assistant toggles
  - sanitize toggles (emails, token/key patterns, remove images)
- CCD v1 builder
- Module SDK + validator + fixture
- Modules:
  - `exporter-json`
  - `exporter-markdown`
  - `publisher-gdocs`
- Background orchestration for download/publish/open-tab results

## Build
```bash
npm install
npm run build
```

## Load Extension
1. Open `chrome://extensions`.
2. Enable Developer Mode.
3. Load unpacked: select `/dist`.

## Add a Module
1. Copy `extension/modules/module-template`.
2. Fill `module.json` and `index.ts` using `ExporterPluginV1` from `src/sdk/types.ts`.
3. Register module in `src/modules/index.ts`.
4. Request required permissions in `manifest.json` and explain in options page.

## Security Model
- Core parses DOM and emits CCD; modules only receive CCD.
- No raw DOM access from modules.
- Local-only mode setting is present and can be enforced per module gate.
- Telemetry is off by default (no analytics code included).
