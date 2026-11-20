import { lookup } from "@oh-my-pi/pi-coding-agent/config/registry";

export default function clickableLinks(pi) {
  const hyperlinks = lookup("tui.hyperlinks");
  if (hyperlinks && !hyperlinks.isConfigured(pi.pi.settings)) {
    hyperlinks.override(pi.pi.settings, "always");
  }
}
