'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Inter, Poppins } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
});

const AVISO_TYPES = [
  { id: 'entrada', label: 'Entrada', icon: '👋', desc: 'Mensaje cuando un miembro se une' },
  { id: 'salida', label: 'Salida', icon: '🚪', desc: 'Mensaje cuando un miembro se va' },
  { id: 'ban', label: 'Ban', icon: '🔨', desc: 'Mensaje cuando alguien es baneado' },
  { id: 'boost', label: 'Boost', icon: '🚀', desc: 'Mensaje cuando alguien impulsa el servidor' },
];

const DEFAULT_CONFIGS = {
  entrada: {
    enabled: false,
    channelId: '',
    message: '¡Hola {user}, bienvenido/a a **{server}**!',
    cardTitle: '¡BIENVENIDO!',
    cardSubtitle: 'Eres el miembro #{count} en {server}',
    bgImage: '',
    bgColor: '#1e1f22',
    borderColor: '#ff5c8a',
    titleColor: '#ffffff',
    usernameColor: '#ff5c8a',
    subtitleColor: '#d1d5db',
    overlayOpacity: 0.55,
  },
  salida: {
    enabled: false,
    channelId: '',
    message: '👋 **{user}** ha salido del servidor.',
  },
  ban: {
    enabled: false,
    channelId: '',
    message: '🔨 **{user}** ha sido baneado del servidor.',
  },
  boost: {
    enabled: false,
    channelId: '',
    message: '🚀 ¡**{user}** ha impulsado el servidor! ¡Gracias por el boost!',
  },
};

export default function GuildDashboard() {
  const { guildId } = useParams();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [channels, setChannels] = useState([]);
  const [guildInfo, setGuildInfo] = useState({ name: 'Mi Servidor', memberCount: 120, icon: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avisosOpen, setAvisosOpen] = useState(true);
  const [activeType, setActiveType] = useState('entrada');
  const [configs, setConfigs] = useState({ ...DEFAULT_CONFIGS });

  const config = configs[activeType] || DEFAULT_CONFIGS[activeType];

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/bot/api/guilds/${guildId}/avisos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfigs((prev) => ({
            entrada: { ...DEFAULT_CONFIGS.entrada, ...(data.config.entrada || {}) },
            salida: { ...DEFAULT_CONFIGS.salida, ...(data.config.salida || {}) },
            ban: { ...DEFAULT_CONFIGS.ban, ...(data.config.ban || {}) },
            boost: { ...DEFAULT_CONFIGS.boost, ...(data.config.boost || {}) },
          }));
        }
        if (data.channels) setChannels(data.channels);
        setGuildInfo({
          name: data.guildName || 'Servidor',
          memberCount: data.memberCount || 1,
          icon: data.guildIcon || null,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const getGuildIconUrl = () => {
    if (!guildInfo.icon) return null;
    const ext = guildInfo.icon.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/icons/${guildId}/${guildInfo.icon}.${ext}?size=128`;
  };

  const updateConfig = (key, value) => {
    setConfigs((prev) => ({
      ...prev,
      [activeType]: { ...prev[activeType], [key]: value },
    }));
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('⚠️ La imagen no puede superar 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateConfig('bgImage', e.target.result);
    };
    reader.onerror = () => alert('❌ Error al leer la imagen');
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/bot/api/guilds/${guildId}/avisos/${activeType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs[activeType]),
      });
      alert('✅ Configuración guardada y sincronizada con Cherry.');
    } catch (e) {
      alert('❌ Error al guardar');
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await fetch(`/api/bot/api/guilds/${guildId}/avisos/${activeType}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id || session?.user?.sub,
          config: configs[activeType],
        }),
      });
      alert('🚀 ¡Mensaje de prueba enviado a Discord!');
    } catch (e) {
      alert('❌ Error al enviar prueba');
    }
    setTesting(false);
  };

  const formatPreviewText = (text) => {
    return (text || '')
      .replace(/{user}/g, session?.user?.name || 'Usuario')
      .replace(/{username}/g, session?.user?.name || 'Usuario')
      .replace(/{server}/g, guildInfo.name)
      .replace(/{count}/g, guildInfo.memberCount);
  };

  const currentTypeInfo = AVISO_TYPES.find((t) => t.id === activeType) || AVISO_TYPES[0];

  if (loading) {
    return (
      <div className={inter.className} style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 24px rgba(255,105,180,0.35)' }}>🍒</div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando panel de Cherry...</p>
      </div>
    );
  }

  return (
    <div className={inter.className} style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', position: 'relative' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(2px)' }} />
      )}

      {/* SIDEBAR */}
      <aside
        className="cherry-sidebar"
        style={{
          width: 250,
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
          padding: '20px 16px',
          paddingTop: 'calc(20px + env(safe-area-inset-top))',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100dvh',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          zIndex: 50,
          overflowY: 'auto',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: getGuildIconUrl() ? 'transparent' : 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden' }}>
              {getGuildIconUrl() ? <img src={getGuildIconUrl()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍒'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guildInfo.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Cherry Panel</div>
            </div>
          </div>

          <nav>
            {/* Mensajería section */}
            <div style={{ marginBottom: 8 }}>
              <div
                onClick={() => setAvisosOpen(!avisosOpen)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', color: 'var(--muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                <span>Mensajería</span>
                <span style={{ fontSize: 10 }}>{avisosOpen ? '▾' : '▸'}</span>
              </div>

              {avisosOpen && (
                <div style={{ marginLeft: 8, borderLeft: '1px solid var(--border)', paddingLeft: 8 }}>
                  <div
                    onClick={() => { setActiveType('entrada'); setSidebarOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: activeType === 'entrada' ? 'rgba(255,105,180,0.15)' : 'transparent',
                      color: activeType === 'entrada' ? 'var(--primary)' : 'var(--text)',
                      fontWeight: activeType === 'entrada' ? 600 : 500,
                      fontSize: 14,
                      cursor: 'pointer',
                      marginBottom: 2,
                    }}
                  >
                    <span>📢</span>
                    <span>Avisos</span>
                    {activeType === 'entrada' && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />}
                  </div>

                  {/* Sub items under Avisos */}
                  <div style={{ marginLeft: 12, borderLeft: '1px solid var(--border)', paddingLeft: 8, marginTop: 4 }}>
                    {AVISO_TYPES.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { setActiveType(t.id); setSidebarOpen(false); }}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 6,
                          fontSize: 13,
                          color: activeType === t.id ? 'var(--primary)' : 'var(--muted)',
                          fontWeight: activeType === t.id ? 600 : 400,
                          cursor: 'pointer',
                          background: activeType === t.id ? 'rgba(255,105,180,0.08)' : 'transparent',
                        }}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px', borderRadius: 8, fontSize: 13, color: 'var(--muted)', marginTop: 16 }}>
          ← Cambiar de servidor
        </a>
      </aside>

      {/* MAIN */}
      <main className="cherry-main" style={{ flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', padding: '16px', paddingTop: 'calc(16px + env(safe-area-inset-top))', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', minWidth: 0 }}>
        {/* TOPBAR MÓVIL */}
        <div className="mobile-topbar" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={() => setSidebarOpen(true)} aria-label="Abrir menú" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, padding: 0, flexShrink: 0 }}>
            ☰
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guildInfo.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Avisos · {currentTypeInfo.label}</div>
          </div>
        </div>

        {/* HEADER */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <h1 className={poppins.className} style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, marginBottom: 4 }}>
              {currentTypeInfo.icon} Aviso de {currentTypeInfo.label}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{currentTypeInfo.desc}</p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', margin: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{config.enabled ? 'Activado' : 'Desactivado'}</span>
            <div style={{ position: 'relative', width: 44, height: 26 }}>
              <input
                type="checkbox"
                checked={!!config.enabled}
                onChange={(e) => updateConfig('enabled', e.target.checked)}
                style={{ opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'pointer', position: 'absolute', zIndex: 2, inset: 0 }}
              />
              <div style={{ width: '100%', height: '100%', borderRadius: 999, background: config.enabled ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s' }} />
              <div style={{ position: 'absolute', top: 3, left: config.enabled ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.35)' }} />
            </div>
          </label>
        </div>

        {/* QUICK TOGGLES for all avisos */}
        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', marginBottom: 12 }}>Activar / Desactivar avisos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {AVISO_TYPES.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveType(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: activeType === t.id ? 'rgba(255,105,180,0.12)' : 'var(--bg)',
                  border: `1px solid ${activeType === t.id ? 'var(--primary)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                <span>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: configs[t.id]?.enabled ? 'var(--success)' : 'var(--muted)' }}>
                    {configs[t.id]?.enabled ? 'ON' : 'OFF'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={!!configs[t.id]?.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    setConfigs((prev) => ({
                      ...prev,
                      [t.id]: { ...prev[t.id], enabled: e.target.checked },
                    }));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
            Cambia el switch de cada uno y guarda desde la sección correspondiente.
          </p>
        </div>

        {/* PREVIEW / FORM */}
        {activeType === 'entrada' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', margin: 0 }}>Vista Previa</h3>
              <button onClick={handleTest} disabled={testing} style={{ fontSize: 12, padding: '8px 12px', background: 'var(--border)', borderRadius: 8, opacity: testing ? 0.6 : 1, border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                {testing ? 'Enviando...' : '🚀 Probar'}
              </button>
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ background: '#313338', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 13, color: '#dbdee1', marginBottom: 8 }}>{formatPreviewText(config.message)}</div>
                <div style={{ background: config.bgColor || '#1e1f22', borderRadius: 8, padding: 16, textAlign: 'center', minHeight: 120, backgroundImage: config.bgImage ? `url(${config.bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 8, background: `rgba(0,0,0,${config.overlayOpacity ?? 0.55})`, borderRadius: 6 }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className={poppins.className} style={{ fontSize: 18, fontWeight: 800, color: config.titleColor, textTransform: 'uppercase' }}>{formatPreviewText(config.cardTitle)}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: config.usernameColor, marginTop: 4 }}>{session?.user?.name || 'Usuario'}</div>
                    <div style={{ fontSize: 12, color: config.subtitleColor, marginTop: 4 }}>{formatPreviewText(config.cardSubtitle)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeType !== 'entrada' && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>Vista previa del mensaje</h3>
              <button onClick={handleTest} disabled={testing} style={{ fontSize: 12, padding: '8px 12px', background: 'var(--border)', borderRadius: 8, border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                {testing ? 'Enviando...' : '🚀 Probar'}
              </button>
            </div>
            <div style={{ background: '#313338', borderRadius: 10, padding: 14, fontSize: 14, color: '#dbdee1' }}>
              {formatPreviewText(config.message)}
            </div>
          </div>
        )}

        {/* FORM */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>⚙️ Configuración</h3>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Canal</label>
              <select
                value={config.channelId || ''}
                onChange={(e) => updateConfig('channelId', e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}
              >
                <option value="">Selecciona un canal</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Mensaje</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateConfig('message', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, resize: 'vertical' }}
                placeholder="Usa {user}, {username}, {server}, {count}"
              />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Placeholders: {'{user}'} {'{username}'} {'{server}'} {'{count}'}</p>
            </div>
          </div>

          {activeType === 'entrada' && (
            <div className="card">
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>🎨 Diseño de la Tarjeta</h3>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Título de la tarjeta</label>
                <input
                  type="text"
                  value={config.cardTitle || ''}
                  onChange={(e) => updateConfig('cardTitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Subtítulo</label>
                <input
                  type="text"
                  value={config.cardSubtitle || ''}
                  onChange={(e) => updateConfig('cardSubtitle', e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Imagen de fondo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0])}
                  style={{ width: '100%', fontSize: 13 }}
                />
                {config.bgImage && (
                  <button onClick={() => updateConfig('bgImage', '')} style={{ marginTop: 8, fontSize: 12, background: 'var(--border)', border: 'none', color: 'var(--text)', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
                    Quitar imagen
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)' }}>Color fondo</label>
                  <input type="color" value={config.bgColor || '#1e1f22'} onChange={(e) => updateConfig('bgColor', e.target.value)} style={{ width: '100%', height: 36, border: 'none', background: 'transparent' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)' }}>Borde avatar</label>
                  <input type="color" value={config.borderColor || '#ff5c8a'} onChange={(e) => updateConfig('borderColor', e.target.value)} style={{ width: '100%', height: 36, border: 'none', background: 'transparent' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)' }}>Color título</label>
                  <input type="color" value={config.titleColor || '#ffffff'} onChange={(e) => updateConfig('titleColor', e.target.value)} style={{ width: '100%', height: 36, border: 'none', background: 'transparent' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--muted)' }}>Color usuario</label>
                  <input type="color" value={config.usernameColor || '#ff5c8a'} onChange={(e) => updateConfig('usernameColor', e.target.value)} style={{ width: '100%', height: 36, border: 'none', background: 'transparent' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SAVE */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 14px rgba(255,105,180,0.35)',
            }}
          >
            {saving ? 'Guardando...' : '💾 Guardar configuración'}
          </button>
        </div>
      </main>

      <style jsx global>{`
        @media (min-width: 768px) {
          .cherry-sidebar {
            transform: translateX(0) !important;
          }
          .cherry-main {
            margin-left: 250px !important;
            width: calc(100% - 250px) !important;
          }
          .mobile-topbar {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
