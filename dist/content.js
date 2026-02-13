const state = { selectMode: false, includeUser: true, includeAssistant: true, selectedIds: new Set(), scope: "all" };
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const TOKEN_REGEX = /(sk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z\-_]{35}|ghp_[A-Za-z0-9]{36})/g;

function scrub(text, options) {
  let value = text;
  if (options.maskEmails) value = value.replace(EMAIL_REGEX, "[REDACTED_EMAIL]");
  if (options.maskSecrets) value = value.replace(TOKEN_REGEX, "[REDACTED_SECRET]");
  return value;
}

function buildCCD() {
  const containers = [...document.querySelectorAll("[data-message-author-role]")];
  const messages = containers.map((el, index) => {
    const role = el.getAttribute("data-message-author-role") === "user" ? "user" : "assistant";
    const id = el.dataset.messageId || `msg-${index}`;
    if (state.scope === "partial" && !state.selectedIds.has(id)) return null;
    if ((role === "user" && !state.includeUser) || (role === "assistant" && !state.includeAssistant)) return null;
    const blocks = [];
    el.querySelectorAll("h1,h2,h3,h4,h5,h6,p,pre,blockquote,table").forEach((node) => {
      if (node.tagName === "P") blocks.push({ type: "paragraph", text: node.textContent?.trim() || "" });
      if (/H[1-6]/.test(node.tagName)) blocks.push({ type: "heading", level: Number(node.tagName[1]), text: node.textContent?.trim() || "" });
      if (node.tagName === "PRE") blocks.push({ type: "code", text: node.textContent || "" });
      if (node.tagName === "BLOCKQUOTE") blocks.push({ type: "quote", text: node.textContent || "" });
      if (node.tagName === "TABLE") {
        const rows = [...node.querySelectorAll("tr")].map((tr) => [...tr.querySelectorAll("th,td")].map((td) => td.textContent?.trim() || ""));
        blocks.push({ type: "table", rows });
      }
    });
    if (!blocks.length) blocks.push({ type: "paragraph", text: el.textContent?.trim() || "" });
    return { id, role, blocks };
  }).filter(Boolean);

  return {
    meta: { sourceApp: "chatgpt", url: location.href, title: document.title, capturedAtISO: new Date().toISOString(), selection: { scope: state.scope, messageIds: messages.map((m) => m.id) } },
    messages,
    assets: [],
    annotations: { warnings: [], redactions: [] }
  };
}

(function init(){
  const panel = document.createElement("aside");
  panel.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:999999;background:#111;color:#fff;padding:12px;border-radius:10px;width:280px;font:12px sans-serif;";
  panel.innerHTML = `<button id="cep-toggle">Select mode: off</button><div><label><input type="checkbox" id="cep-user" checked> Include user</label></div><div><label><input type="checkbox" id="cep-assistant" checked> Include assistant</label></div><div><label><input type="checkbox" id="cep-mask-emails"> Mask emails</label></div><div><label><input type="checkbox" id="cep-mask-secrets"> Mask tokens/keys</label></div><div><label><input type="checkbox" id="cep-remove-images"> Remove images</label></div><div><select id="cep-module"><option value="exporter-markdown">Markdown</option><option value="exporter-json">JSON</option><option value="publisher-gdocs">Google Docs</option></select></div><button id="cep-preview">Preview</button><button id="cep-export">Run module</button><pre id="cep-status"></pre>`;
  document.body.appendChild(panel);
  const status = panel.querySelector("#cep-status");

  panel.querySelector("#cep-toggle").addEventListener("click", () => {
    state.selectMode = !state.selectMode;
    state.scope = state.selectMode ? "partial" : "all";
    panel.querySelector("#cep-toggle").textContent = `Select mode: ${state.selectMode ? "on" : "off"}`;
    document.querySelectorAll(".cep-checkbox").forEach((e) => e.remove());
    if (state.selectMode) {
      [...document.querySelectorAll("[data-message-author-role]")].forEach((node, index) => {
        const id = node.dataset.messageId || `msg-${index}`;
        const cb = document.createElement("input"); cb.type = "checkbox"; cb.className = "cep-checkbox"; cb.style.marginRight = "8px";
        cb.addEventListener("change",()=> cb.checked ? state.selectedIds.add(id) : state.selectedIds.delete(id));
        node.prepend(cb);
      });
    }
  });
  panel.querySelector("#cep-user").addEventListener("change", (e) => state.includeUser = e.target.checked);
  panel.querySelector("#cep-assistant").addEventListener("change", (e) => state.includeAssistant = e.target.checked);

  panel.querySelector("#cep-preview").addEventListener("click", () => {
    status.textContent = `${buildCCD().messages.length} messages selected`;
  });

  panel.querySelector("#cep-export").addEventListener("click", async () => {
    const ccd = buildCCD();
    const opts = { maskEmails: panel.querySelector("#cep-mask-emails").checked, maskSecrets: panel.querySelector("#cep-mask-secrets").checked, removeImages: panel.querySelector("#cep-remove-images").checked };
    ccd.messages.forEach((m)=>m.blocks = m.blocks.filter((b)=> opts.removeImages ? b.type !== "image" : true).map((b)=>{
      if (b.type === "paragraph" || b.type === "quote" || b.type === "heading") b.text = scrub(b.text, opts);
      if (b.type === "code") b.text = scrub(b.text, opts);
      return b;
    }));
    const response = await chrome.runtime.sendMessage({ type: "RUN_MODULE", moduleId: panel.querySelector("#cep-module").value, ccd });
    status.textContent = response.ok ? `Success: ${response.message}` : `Error: ${response.error}`;
  });
})();
