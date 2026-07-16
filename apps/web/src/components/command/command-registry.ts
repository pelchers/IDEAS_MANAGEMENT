/** Minimal router surface the palette needs (structurally satisfied by useRouter()). */
export interface PaletteRouter {
  push: (href: string) => void;
  replace?: (href: string) => void;
  refresh?: () => void;
}

/**
 * A single command surfaced in the Cmd-K palette.
 */
export interface Command {
  id: string;
  title: string;
  subtitle?: string;
  /** Group heading, e.g. "Navigation", "Actions", "Projects", "Integrations". */
  group: string;
  /** Extra text matched by search but not displayed. */
  keywords?: string;
  /** Short glyph/emoji shown at the leading edge. */
  icon?: string;
  perform: (ctx: CommandContext) => void | Promise<void>;
}

export interface CommandContext {
  router: PaletteRouter;
  /** Close the palette. */
  close: () => void;
}

type CommandProvider = () => Command[];

const providers = new Set<CommandProvider>();
const listeners = new Set<() => void>();

/**
 * Register a set of commands with the palette. Returns an unsubscribe fn.
 * Features and integrations call this to contribute their own commands, so the
 * palette stays open/extensible rather than hardcoding every action.
 *
 * @example
 *   useEffect(() => registerCommands(() => [
 *     { id: "today.capture", title: "Quick capture task", group: "Actions",
 *       perform: ({ router }) => router.push("/today?capture=1") },
 *   ]), []);
 */
export function registerCommands(provider: CommandProvider): () => void {
  providers.add(provider);
  notify();
  return () => {
    providers.delete(provider);
    notify();
  };
}

/** Flatten all currently-registered commands. Provider errors are ignored. */
export function getRegisteredCommands(): Command[] {
  const out: Command[] = [];
  for (const p of providers) {
    try {
      out.push(...p());
    } catch {
      /* a broken provider must not take down the palette */
    }
  }
  return out;
}

/** Subscribe to registry changes (add/remove providers). */
export function subscribeCommands(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify() {
  for (const l of listeners) l();
}

/** Open the palette from anywhere (top-bar search, buttons, shortcuts). */
export const OPEN_EVENT = "im:open-command-palette";
export function openCommandPalette(initialQuery?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { initialQuery } }));
}

