# omp-clickable-links

A dependency-free omp extension that makes Markdown web links in assistant replies clickable. Click a link to open it in your default browser. It does not depend on terminal-native hyperlinks, and never passes a URL through a shell.

## Install

Review the two source files, then link a local copy:

```sh
omp plugin link /path/to/omp-clickable-links
```

Restart omp after installation. The extension enables assistant reply renderers and mouse capture for the session unless you have explicitly configured those settings. Explicit `false` settings take precedence. Mouse capture changes selection to Shift-drag and disables normal wheel scrollback; use your terminal's keyboard scrollback or turn capture off. Uninstall with `omp plugin uninstall omp-clickable-links`.

## Usage and limitations

- Click a Markdown link in an assistant reply. Bare URLs and Markdown forms the extension cannot rewrite are unchanged. Only HTTP and HTTPS URLs are handled.
- The extension preserves the link text and displayed destination, but omp draws extension-handled links with an underline and may use a different color.
- Links in older terminal scrollback cannot be clicked in place. Press Alt+O twice to open omp's link browser, then click the entry or use its letter hint.
- URLs are untrusted and open without confirmation; a link label may hide its actual destination. Check the destination before clicking. URLs with embedded credentials are rejected.
- This handles assistant text in omp's plain terminal interface, not arbitrary tool output or Tern's native interface. Explicitly disabling `tui.mouse` prevents direct clicks; Alt+O still offers keyboard selection. Explicitly disabling `extensionRenderers.assistantText` disables the plugin's link entries.
- Runs `/usr/bin/open` on macOS or `xdg-open` on Linux. The browser may follow redirects after opening.

Requires an omp version exposing `registerLinkScheme`, `registerAssistantTextRenderer`, and the settings registry (tested with omp 18.22.2). Extensions run in-process and are not sandboxed; review source before installing any plugin.
