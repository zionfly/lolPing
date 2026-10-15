import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { aiCommandArgs, expandHome, type AiAction } from '../shared/ai';

/**
 * Starts the lolping-ai script for a ping and forgets it: the script captures the screen, talks to the agent and shows
 * its own notifications, so a slow agent never holds up the wheel.
 */
export function launchAi(command: string, action: AiAction, x: number, y: number, log: (msg: string) => void): void {
  const file = expandHome(command, homedir());
  try {
    const child = spawn(file, aiCommandArgs(action, x, y), { detached: true, stdio: 'ignore' });
    child.on('error', (err) => log(`lolping-ai: cannot run ${file}: ${err.message}`));
    child.unref();
  } catch (err) {
    log(`lolping-ai: cannot run ${file}: ${err instanceof Error ? err.message : String(err)}`);
  }
}
