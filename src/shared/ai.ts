import { isPingId, type PingId } from './pings';

/** What a ping asks the `lolping-ai` script to do after it lands. */
export type AiAction = 'note' | 'reply' | 'explain' | 'search' | 'todo';
export const AI_ACTIONS: readonly AiAction[] = ['note', 'reply', 'explain', 'search', 'todo'];

/** Pings that start an AI action. A ping missing from the map is only a ping. */
export type AiPingMap = Partial<Record<PingId, AiAction>>;

export const DEFAULT_AI_PING_MAP: Readonly<AiPingMap> = {
  push: 'note',
  omw: 'reply',
  assist: 'explain',
  needvision: 'search',
  danger: 'todo',
};

export const DEFAULT_AI_COMMAND = '~/.local/bin/lolping-ai';

export const isAiAction = (v: unknown): v is AiAction => typeof v === 'string' && (AI_ACTIONS as readonly string[]).includes(v);

export function normalizeAiPingMap(raw: unknown): AiPingMap {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ...DEFAULT_AI_PING_MAP };
  const map: AiPingMap = {};
  for (const [id, action] of Object.entries(raw)) {
    if (isPingId(id) && isAiAction(action)) map[id] = action;
  }
  return map;
}

/** A path for the script; anything else falls back to the default, so the setting can't smuggle in shell syntax. */
export function normalizeAiCommand(raw: unknown): string {
  if (typeof raw !== 'string') return DEFAULT_AI_COMMAND;
  const s = raw.trim();
  return /^~?[A-Za-z0-9_./ -]{1,300}$/.test(s) && s !== '~' ? s : DEFAULT_AI_COMMAND;
}

export function aiActionFor(enabled: boolean, map: AiPingMap, id: PingId): AiAction | null {
  return enabled ? map[id] ?? null : null;
}

/** Arguments for the script: the ping's global point (macOS points) and the action. */
export function aiCommandArgs(action: AiAction, x: number, y: number): string[] {
  return ['--at', `${Math.round(x)},${Math.round(y)}`, action];
}

/** Expands a leading "~/" the way a shell would. */
export function expandHome(path: string, home: string): string {
  return path === '~' ? home : path.startsWith('~/') ? `${home}${path.slice(1)}` : path;
}
