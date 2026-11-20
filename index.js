import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { lookup } from "@oh-my-pi/pi-coding-agent/config/registry";

const exec = promisify(execFile);
const scheme = "omp-open-web";

export function webUrl(value) {
  if (value.length > 8192 || /[\x00-\x20\x7f]/.test(value)) return;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return;
    return url.href;
  } catch {
    return;
  }
}

export function linksIn(text) {
  const found = new Set();
  for (const match of text.matchAll(/https?:\/\/[^\s<>"'`]+/gi)) {
    let raw = match[0].replace(/[.,!?;:]+$/, "");
    while (raw.endsWith(")") && (raw.match(/\)/g)?.length ?? 0) > (raw.match(/\(/g)?.length ?? 0)) {
      raw = raw.slice(0, -1);
    }
    const url = webUrl(raw);
    if (url) found.add(url);
  }
  return [...found];
}

export function clickableMarkdown(text) {
  const rewritten = new Set();
  let fence;
  const lines = text.split("\n").map(line => {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      return line;
    }
    if (marker) {
      fence = marker[1];
      return line;
    }
    return line.replace(/(`+)(.*?)\1|(?<!!)(?<!\\)\[([^\]\n]+)\]\((https?:\/\/[^\s)]+(?:\([^()\s]*\)[^\s)]*)*)\)/gi,
      (match, ticks, _code, label, destination) => {
        if (ticks) return match;
        const url = webUrl(destination);
        if (!url) return match;
        rewritten.add(url);
        return `[${label}](${scheme}:${encodeURIComponent(url)})`;
      });
  });
  const remaining = linksIn(text).filter(url => !rewritten.has(url));
  let result = lines.join("\n");
  if (remaining.length) result += "\n\nOpen links: " + remaining.map((url, i) =>
    `[${i + 1}](${scheme}:${encodeURIComponent(url)})`
  ).join(" ");
  return result;
}

export default function clickableLinks(pi) {
  for (const [name, value] of [
    ["extensionRenderers.assistantText", true],
    ["tui.mouse", true],
  ]) {
    const setting = lookup(name);
    if (setting && !setting.isConfigured(pi.pi.settings)) setting.override(pi.pi.settings, value);
  }

  let ui;
  pi.registerLinkScheme(scheme);
  pi.on("session_start", (_event, ctx) => { ui = ctx.ui; });
  pi.registerAssistantTextRenderer(({ text }) => {
    if (!ui?.getLinkClicksAvailable()) return;
    return clickableMarkdown(text);
  });
  pi.on("link_activate", async ({ url }, ctx) => {
    let target;
    try {
      if (!url.startsWith(`${scheme}:`)) return;
      target = webUrl(decodeURIComponent(url.slice(scheme.length + 1)));
    } catch {
      return;
    }
    if (!target) return;
    const command = process.platform === "darwin" ? "/usr/bin/open" :
      process.platform === "linux" ? "xdg-open" : undefined;
    if (!command) return ctx.ui.notify("Unsupported operating system", "error");
    try {
      await exec(command, [target], { timeout: 10000 });
    } catch (error) {
      ctx.ui.notify(`Could not open link: ${error.message}`, "error");
    }
  });
}
