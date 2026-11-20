# omp-clickable-links

A dependency-free omp extension that adds clickable **Open links: 1 2 …** entries beneath assistant replies containing web URLs. Click a number, review the destination, and confirm to open it in your default browser. It does not depend on terminal-native hyperlinks, and never passes a URL through a shell.

## Install

Review the two source files, then link a local copy:

```sh
omp plugin link /path/to/omp-clickable-links
```

Restart omp after installation. The extension enables assistant reply renderers and mouse capture for the session unless you have explicitly configured those settings. Explicit `false` settings take precedence. Mouse capture changes selection to Shift-drag and disables normal wheel scrollback; use your terminal's keyboard scrollback or turn capture off. Uninstall with `omp plugin uninstall omp-clickable-links`.

## Usage and limitations

- Click the numbered entry beneath an assistant reply; the original link text is not itself intercepted. Only HTTP and HTTPS URLs are offered. Repeated URLs are deduplicated within each text block.
- Links in older terminal scrollback cannot be clicked in place. Press Alt+O twice to open omp's link browser, then click the entry or use its letter hint.
- The confirmation displays the full destination. URLs are untrusted; confirm only destinations you recognize. URLs with embedded credentials are rejected.
- This handles assistant text in omp's plain terminal interface, not arbitrary tool output or Tern's native interface. Explicitly disabling `tui.mouse` prevents direct clicks; Alt+O still offers keyboard selection. Explicitly disabling `extensionRenderers.assistantText` disables the plugin's link entries.
- Runs `/usr/bin/open` on macOS or `xdg-open` on Linux. The browser may follow redirects after opening.

Requires an omp version exposing `registerLinkScheme`, `registerAssistantTextRenderer`, and the settings registry (tested with omp 18.22.2). Extensions run in-process and are not sandboxed; review source before installing any plugin.
