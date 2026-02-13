import { buildCCDFromDom } from "../core/ccd-builder";
import { sanitizeCCD } from "../core/sanitizer";

const state = {
  selectMode: false,
  includeUser: true,
  includeAssistant: true,
  selectedIds: new Set<string>(),
  scope: "all" as "all" | "partial"
};

function init() {
  const panel = document.createElement("aside");
  panel.setAttribute("aria-label", "Chat export controls");
  panel.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:999999;background:#111;color:#fff;padding:12px;border-radius:10px;width:280px;font:12px sans-serif;";
  panel.innerHTML = `
    <button id="cep-toggle" aria-label="Toggle select mode">Select mode: off</button>
    <div><label><input type="checkbox" id="cep-user" checked> Include user</label></div>
    <div><label><input type="checkbox" id="cep-assistant" checked> Include assistant</label></div>
    <div><label><input type="checkbox" id="cep-mask-emails"> Mask emails</label></div>
    <div><label><input type="checkbox" id="cep-mask-secrets"> Mask tokens/keys</label></div>
    <div><label><input type="checkbox" id="cep-remove-images"> Remove images</label></div>
    <div><label>Module
      <select id="cep-module">
        <option value="exporter-markdown">Markdown</option>
        <option value="exporter-json">JSON</option>
        <option value="publisher-gdocs">Google Docs</option>
      </select>
    </label></div>
    <button id="cep-preview">Preview selection</button>
    <button id="cep-export">Run module</button>
    <pre id="cep-status" aria-live="polite" style="white-space:pre-wrap;max-height:120px;overflow:auto"></pre>
  `;
  document.body.appendChild(panel);

  const toggleButton = panel.querySelector<HTMLButtonElement>("#cep-toggle")!;
  const status = panel.querySelector<HTMLElement>("#cep-status")!;

  toggleButton.addEventListener("click", () => {
    state.selectMode = !state.selectMode;
    state.scope = state.selectMode ? "partial" : "all";
    toggleButton.textContent = `Select mode: ${state.selectMode ? "on" : "off"}`;
    decorateMessages();
  });

  panel.querySelector<HTMLInputElement>("#cep-user")!.addEventListener("change", (event) => {
    state.includeUser = (event.target as HTMLInputElement).checked;
  });

  panel.querySelector<HTMLInputElement>("#cep-assistant")!.addEventListener("change", (event) => {
    state.includeAssistant = (event.target as HTMLInputElement).checked;
  });

  panel.querySelector<HTMLButtonElement>("#cep-preview")!.addEventListener("click", () => {
    const ccd = buildCCDFromDom({
      scope: state.scope,
      includeUser: state.includeUser,
      includeAssistant: state.includeAssistant,
      selectedIds: state.selectedIds
    });
    status.textContent = `${ccd.messages.length} messages selected`;
  });

  panel.querySelector<HTMLButtonElement>("#cep-export")!.addEventListener("click", async () => {
    const ccd = sanitizeCCD(
      buildCCDFromDom({
        scope: state.scope,
        includeUser: state.includeUser,
        includeAssistant: state.includeAssistant,
        selectedIds: state.selectedIds
      }),
      {
        maskEmails: panel.querySelector<HTMLInputElement>("#cep-mask-emails")!.checked,
        maskSecrets: panel.querySelector<HTMLInputElement>("#cep-mask-secrets")!.checked,
        removeImages: panel.querySelector<HTMLInputElement>("#cep-remove-images")!.checked
      }
    );

    const moduleId = panel.querySelector<HTMLSelectElement>("#cep-module")!.value;
    const response = await chrome.runtime.sendMessage({ type: "RUN_MODULE", moduleId, ccd });
    status.textContent = response?.ok ? `Success: ${response.message}` : `Error: ${response?.error || "Unknown"}`;
  });
}

function decorateMessages() {
  document.querySelectorAll(".cep-checkbox").forEach((element) => element.remove());
  if (!state.selectMode) return;

  Array.from(document.querySelectorAll<HTMLElement>("[data-message-author-role]")).forEach((node, index) => {
    const id = node.dataset.messageId || `msg-${index}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "cep-checkbox";
    checkbox.style.cssText = "margin-right:8px;outline:2px solid #19c37d";
    checkbox.checked = state.selectedIds.has(id);
    checkbox.setAttribute("aria-label", `Select message ${index + 1}`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) state.selectedIds.add(id);
      else state.selectedIds.delete(id);
    });
    node.prepend(checkbox);
  });
}

init();
