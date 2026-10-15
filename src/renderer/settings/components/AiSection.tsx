import { Dropdown, Option } from '@fluentui/react-components';
import { Bot24Regular, Code24Regular } from '@fluentui/react-icons';
import { AI_ACTIONS, isAiAction, type AiPingMap } from '../../../shared/ai';
import { pingsFor, textureUrl, type PingId } from '../../../shared/pings';
import type { Settings } from '../../../shared/settings';
import { useText } from '../text';
import type { Update } from '../useAppState';
import { SettingRow, SwitchRow } from './rows';

const NONE = 'none';

/** The map with one ping's action changed; NONE removes the ping from it. */
function withAction(map: AiPingMap, id: PingId, value: string): AiPingMap {
  const next: AiPingMap = { ...map };
  if (isAiAction(value)) next[id] = value;
  else delete next[id];
  return next;
}

/** macOS only: which pings also run the lolping-ai script. */
export function AiSection(props: { settings: Settings; update: Update }) {
  const t = useText();
  const s = props.settings;
  const off = !s.aiPings;
  const label = (v: string) => (isAiAction(v) ? t.aiActionNames[v] : t.aiActionNone);
  // Every ping you can place: the wheel, and the trigger + click ping when that is on.
  const ids = [...new Set<PingId>(s.clickPing ? [...s.wheel, s.clickPingId] : s.wheel)];
  return (
    <>
      <SwitchRow icon={<Bot24Regular />} title={t.aiPings} description={t.aiPingsDesc}
        checked={s.aiPings} onChange={(v) => void props.update({ aiPings: v })} />
      <SettingRow icon={<Code24Regular />} title={t.aiCommand} description={t.aiCommandDesc} dim={off}>
        <code>{s.aiCommand}</code>
      </SettingRow>
      <div className={`card${off ? ' dim' : ''}`}>
        <div className="lbl">
          {t.aiMapTitle}
          <span className="desc">{t.aiMapDesc}</span>
        </div>
      </div>
      {pingsFor(ids).map((p) => {
        const value = s.aiPingMap[p.id] ?? NONE;
        return (
          <SettingRow key={p.id} icon={<img src={textureUrl(p.icon)} width={24} height={24} alt="" />}
            title={t.pingNames[p.id]} dim={off}>
            <Dropdown
              style={{ minWidth: 170 }}
              value={label(value)}
              selectedOptions={[value]}
              onOptionSelect={(_, d) => void props.update({ aiPingMap: withAction(s.aiPingMap, p.id, d.optionValue ?? NONE) })}
            >
              {[NONE, ...AI_ACTIONS].map((v) => (
                <Option key={v} value={v} text={label(v)}>{label(v)}</Option>
              ))}
            </Dropdown>
          </SettingRow>
        );
      })}
    </>
  );
}
