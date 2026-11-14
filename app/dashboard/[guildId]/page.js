'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getGuildSettings,
  updateGuildSettings,
  getChannels,
  getRoles,
  getLeaderboard,
  getTempVoice,
  setTempVoice,
} from '../../../lib/botApi';

export default function GuildDashboard() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const guildId = params.guildId;

  const [settings, setSettings] = useState(null);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tempVoice, setTempVoiceState] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/');
  }, [status, router]);

  useEffect(() => {
    if (!guildId) return;
    Promise.all([
      getGuildSettings(guildId).catch(() => null),
      getChannels(guildId).catch(() => []),
      getRoles(guildId).catch(() => []),
      getLeaderboard(guildId).catch(() => []),
      getTempVoice(guildId).catch(() => []),
    ]).then(([s, c, r, lb, tv]) => {
      setSettings(s);
      setChannels(c);
      setRoles(r);
      setLeaderboard(lb);
      setTempVoiceState(tv);
    });
  }, [guildId]);

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const form = new FormData(e.target);
      const data = {
        welcome_channel_id: form.get('welcome_channel_id') || null,
        welcome_message: form.get('welcome_message'),
        autorole_id: form.get('autorole_id') || null,
        modlog_channel_id: form.get('modlog_channel_id') || null,
        leveling_enabled: form.get('leveling_enabled') === 'on' ? 1 : 0,
        levelup_channel_id: form.get('levelup_channel_id') || null,
        antimod_enabled: form.get('antimod_enabled') === 'on' ? 1 : 0,
      };
      await updateGuildSettings(guildId, data);
      setMessage('✅ Guardado correctamente');
      setSettings(prev => ({ ...prev, ...data }));
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveTempVoice(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData(e.target);
      const selected = form.getAll('tempvoice');
      await setTempVoice(guildId, selected);
      setTempVoiceState(selected);
      setMessage('✅ TempVoice actualizado');
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || !settings) {
    return <div className="container"><p>Cargando...</p></div>;
  }

  const textChannels = channels.filter(c => c.type === 0);
  const voiceChannels = channels.filter(c => c.type === 2);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 style={{ marginBottom: '1.5rem' }}>🍒 Cherry</h2>
        <Link href="/" className="nav-link">← Servidores</Link>
        <div style={{ margin: '1.5rem 0', borderTop: '1px solid var(--border)' }} />
        <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')} style={{ width: '100%', textAlign: 'left', background: 'none', color: 'inherit' }}>
          ⚙️ Ajustes
        </button>
        <button className={`nav-link ${activeTab === 'levels' ? 'active' : ''}`} onClick={() => setActiveTab('levels')} style={{ width: '100%', textAlign: 'left', background: 'none', color: 'inherit' }}>
          📊 Levels
        </button>
        <button className={`nav-link ${activeTab === 'tempvoice' ? 'active' : ''}`} onClick={() => setActiveTab('tempvoice')} style={{ width: '100%', textAlign: 'left', background: 'none', color: 'inherit' }}>
          🔊 TempVoice
        </button>
      </aside>

      <main className="main">
        {message && <div className="card" style={{ marginBottom: '1.5rem' }}>{message}</div>}

        {activeTab === 'settings' && (
          <div>
            <h1>Ajustes del servidor</h1>
            <form onSubmit={saveSettings} className="card" style={{ maxWidth: 600 }}>
              <div className="form-group">
                <label>Canal de bienvenida</label>
                <select name="welcome_channel_id" defaultValue={settings.welcome_channel_id || ''}>
                  <option value="">— Desactivado —</option>
                  {textChannels.map(c => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mensaje de bienvenida</label>
                <textarea name="welcome_message" rows={3} defaultValue={settings.welcome_message || ''} placeholder="Welcome {user} to {server}!" />
              </div>

              <div className="form-group">
                <label>AutoRole</label>
                <select name="autorole_id" defaultValue={settings.autorole_id || ''}>
                  <option value="">— Ninguno —</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Canal de Mod-Log</label>
                <select name="modlog_channel_id" defaultValue={settings.modlog_channel_id || ''}>
                  <option value="">— Desactivado —</option>
                  {textChannels.map(c => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" name="leveling_enabled" defaultChecked={!!settings.leveling_enabled} /> Activar sistema de niveles
                </label>
              </div>

              <div className="form-group">
                <label>Canal de level-up</label>
                <select name="levelup_channel_id" defaultValue={settings.levelup_channel_id || ''}>
                  <option value="">— Mismo canal del mensaje —</option>
                  {textChannels.map(c => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" name="antimod_enabled" defaultChecked={!!settings.antimod_enabled} /> Activar AutoMod (anti-invite)
                </label>
              </div>

              <button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'levels' && (
          <div>
            <h1>Sistema de niveles</h1>
            <div className="card">
              <h3>Leaderboard (Top 20)</h3>
              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>Aún no hay datos.</p>
              ) : (
                <ol style={{ paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                  {leaderboard.map((u, i) => (
                    <li key={u.user_id}>
                      <code>{u.user_id}</code> — Nivel <strong>{u.level}</strong> ({u.total_xp.toLocaleString()} XP)
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tempvoice' && (
          <div>
            <h1>TempVoice</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
              Selecciona los canales de voz que actuarán como “creadores”. Al unirse, se crea un canal temporal.
            </p>
            <form onSubmit={saveTempVoice} className="card">
              {voiceChannels.length === 0 ? (
                <p>No hay canales de voz.</p>
              ) : (
                voiceChannels.map(c => (
                  <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="checkbox"
                      name="tempvoice"
                      value={c.id}
                      defaultChecked={tempVoice.includes(c.id)}
                    />
                    🔊 {c.name}
                  </label>
                ))
              )}
              <button type="submit" disabled={saving} style={{ marginTop: '1rem' }}>
                {saving ? 'Guardando...' : 'Guardar TempVoice'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
