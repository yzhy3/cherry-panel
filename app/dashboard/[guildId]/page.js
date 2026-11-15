'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Inter, Poppins } from 'next/font/google';
import Link from 'next/link';

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
  { id: 'entrada', label: 'Entrada', icon: '👋', desc: 'Recibe a los nuevos miembros con una tarjeta personalizada.' },
  { id: 'salida', label: 'Salida', icon: '🚪', desc: 'Notifica cuando un miembro abandona el servidor.' },
  { id: 'ban', label: 'Ban', icon: '🔨', desc: 'Avisa cuando alguien es baneado del servidor.' },
  { id: 'boost', label: 'Boost', icon: '🚀', desc: 'Agradece a quien impulse el servidor.' },
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
  const currentTypeInfo = AVISO_TYPES.find((t) => t.id === activeType) || AVISO_TYPES[0];

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
    return () => { document.body.style.overflow = ''; };
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
    reader.onload = (e) => updateConfig('bgImage', e.target.result);
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
    } catch {
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
    } catch {
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

  if (loading) {
    return (
      <div className={inter.className} style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: getGuildIconUrl() ? 'transparent' : 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 24px rgba(255,105,180,0.35)', overflow: 'hidden' }}>
          {getGuildIconUrl() ? <img src={getGuildIconUrl()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍒'}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando panel de Cherry...</p>
      </div>
    );
  }

  return (
    <div className={inter.className} style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', display: 'flex', position: 'relative' }}>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }} />
      )}

      {/* ========== SIDEBAR ========== */}
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
          WebkitOverflowScrolling: 'touch',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: getGuildIconUrl() ? 'transparent' : 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 4px 14px rgba(255,105,180,0.35)', flexShrink: 0, overflow: 'hidden' }}>
              {getGuildIconUrl() ? <img src={getGuildIconUrl()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍒'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guildInfo.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Cherry Panel</div>
            </div>
          </div>

          <nav>
            {/* Mensajería */}
            <div style={{ marginBottom: 4 }}>
              <div
                onClick={() => setAvisosOpen(!avisosOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  color: 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  userSelect: 'none',
                }}
              >
                <span>Mensajería</span>
                <span style={{ fontSize: 10, transition: 'transform 0.2s', transform: avisosOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
              </div>

              {avisosOpen && (
                <div style={{ marginLeft: 4 }}>
                  {/* Avisos parent */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: 'rgba(255,105,180,0.12)',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>📢</span>
                    <span>Avisos</span>
                  </div>

                  {/* Sub-items */}
                  <div style={{ marginLeft: 12, borderLeft: '1px solid var(--border)', paddingLeft: 4 }}>
                    {AVISO_TYPES.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { setActiveType(t.id); setSidebarOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '9px 12px',
                          borderRadius: 6,
                          fontSize: 13,
                          color: activeType === t.id ? 'var(--primary)' : 'var(--muted)',
                          fontWeight: activeType === t.id ? 600 : 400,
                          cursor: 'pointer',
                          background: activeType === t.id ? 'rgba(255,105,180,0.08)' : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{t.icon}</span>
                        <span>{t.label}</span>
                        {configs[t.id]?.enabled && (
                          <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 6px var(--success)' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--muted)',
            marginTop: 16,
          }}
        >
          ← Cambiar de servidor
        </Link>
      </aside>

      {/* ========== MAIN ========== */}
      <main
        className="cherry-main"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1100,
          margin: '0 auto',
          padding: '16px',
          paddingTop: 'calc(16px + env(safe-area-inset-top))',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          paddingLeft: 'max(16px, env(safe-area-inset-left))',
          paddingRight: 'max(16px, env(safe-area-inset-right))',
          minWidth: 0,
        }}
      >
        {/* TOPBAR MÓVIL */}
        <div className="mobile-topbar" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text)',
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 20,
              padding: 0,
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            ☰
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guildInfo.name}</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Avisos · {currentTypeInfo.label}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, overflow: 'hidden', boxShadow: '0 4px 12px rgba(255,105,180,0.3)' }}>
            {session?.user?.image ? <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (session?.user?.name?.[0]?.toUpperCase() || '?')}
          </div>
        </div>

        {/* HEADER MÓDULO */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ minWidth: 0 }}>
            <h1 className={poppins.className} style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, marginBottom: 4, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {currentTypeInfo.icon} Aviso de {currentTypeInfo.label}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>{currentTypeInfo.desc}</p>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '10px 16px',
              margin: 0,
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>{config.enabled ? 'Activado' : 'Desactivado'}</span>
            <div style={{ position: 'relative', width: 44, height: 26 }}>
              <input
                type="checkbox"
                checked={!!config.enabled}
                onChange={(e) => updateConfig('enabled', e.target.checked)}
                style={{ opacity: 0, width: '100%', height: '100%', margin: 0, cursor: 'pointer', position: 'absolute', zIndex: 2, inset: 0 }}
              />
              <div style={{ width: '100%', height: '100%', borderRadius: 999, background: config.enabled ? 'var(--primary)' : 'var(--border)', transition: 'background 0.2s', boxShadow: config.enabled ? '0 0 12px rgba(255,105,180,0.5)' : 'inset 0 1px 2px rgba(0,0,0,0.3)' }} />
              <div style={{ position: 'absolute', top: 3, left: config.enabled ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.35)' }} />
            </div>
          </label>
        </div>

        {/* ========== VISTA PREVIA (solo Entrada tiene tarjeta completa) ========== */}
        {activeType === 'entrada' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', margin: 0 }}>Vista Previa en Vivo</h3>
              <button
                onClick={handleTest}
                disabled={testing}
                style={{
                  fontSize: 12,
                  padding: '10px 14px',
                  background: 'var(--border)',
                  borderRadius: 8,
                  opacity: testing ? 0.6 : 1,
                  minHeight: 40,
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: 'none',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {testing ? 'Enviando...' : '🚀 Probar en Discord'}
              </button>
            </div>

            <div style={{ padding: 12, background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ background: '#313338', borderRadius: 12, padding: 12, boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.4)' }}>
                {/* Mensaje de texto */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: getGuildIconUrl() ? 'transparent' : 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {getGuildIconUrl() ? <img src={getGuildIconUrl()} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍒'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>Cherry</span>
                      <span style={{ fontSize: 10, color: '#949ba4' }}>Bot</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#dbdee1', lineHeight: 1.4, wordBreak: 'break-word' }}>
                      {formatPreviewText(config.message)}
                    </div>
                  </div>
                </div>

                {/* Tarjeta de bienvenida */}
                <div
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    background: config.bgColor || '#1e1f22',
                    backgroundImage: config.bgImage ? `url(${config.bgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    minHeight: 160,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${config.overlayOpacity ?? 0.55})` }} />
                  <div style={{ position: 'relative', zIndex: 1, padding: '20px 16px', textAlign: 'center' }}>
                    {/* Avatar simulado */}
                    <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px', border: `3px solid ${config.borderColor || '#ff5c8a'}`, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
                          {(session?.user?.name?.[0] || 'U').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <h4 className={poppins.className} style={{ fontSize: 'clamp(15px, 3.5vw, 22px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: config.titleColor || '#fff', margin: 0, lineHeight: 1.15, wordBreak: 'break-word', textShadow: '0 2px 4px rgba(0,0,0,0.7), 0 4px 12px rgba(0,0,0,0.5)' }}>
                      {formatPreviewText(config.cardTitle)}
                    </h4>
                    <p className={poppins.className} style={{ fontSize: 'clamp(13px, 2.8vw, 16px)', fontWeight: 700, marginTop: 4, color: config.usernameColor || '#ff5c8a', wordBreak: 'break-word', textShadow: '0 2px 4px rgba(0,0,0,0.7)' }}>
                      {session?.user?.name || 'Usuario#0000'}
                    </p>
                    <p className={inter.className} style={{ fontSize: 'clamp(11px, 2.4vw, 13px)', fontWeight: 500, marginTop: 6, color: config.subtitleColor || '#d1d5db', wordBreak: 'break-word', opacity: 0.95, textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                      {formatPreviewText(config.cardSubtitle)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview simple para los otros avisos */}
        {activeType !== 'entrada' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', margin: 0 }}>Vista Previa</h3>
              <button
                onClick={handleTest}
                disabled={testing}
                style={{ fontSize: 12, padding: '10px 14px', background: 'var(--border)', borderRadius: 8, border: 'none', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, opacity: testing ? 0.6 : 1 }}
              >
                {testing ? 'Enviando...' : '🚀 Probar en Discord'}
              </button>
            </div>
            <div style={{ padding: 12, background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ background: '#313338', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #ff69b4, #ff85c2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🍒</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>Cherry</span>
                      <span style={{ fontSize: 10, color: '#949ba4' }}>Bot</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#dbdee1', lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {formatPreviewText(config.message)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== FORMULARIOS ========== */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 }}>
          {/* Config básica */}
          <div className="card" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              ⚙️ Configuración
            </h3>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Canal</label>
              <select
                value={config.channelId || ''}
                onChange={(e) => updateConfig('channelId', e.target.value)}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}
              >
                <option value="">Selecciona un canal</option>
                {channels.map((c) => (
                  <option key={c.id} value={c.id}>#{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Mensaje</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => updateConfig('message', e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, resize: 'vertical', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)', lineHeight: 1.45 }}
                placeholder="Usa {user}, {username}, {server}, {count}"
              />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.4 }}>
                Placeholders: <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 4 }}>{'{user}'}</code>{' '}
                <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 4 }}>{'{username}'}</code>{' '}
                <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 4 }}>{'{server}'}</code>{' '}
                <code style={{ background: 'var(--bg)', padding: '1px 5px', borderRadius: 4 }}>{'{count}'}</code>
              </p>
            </div>
          </div>

          {/* Diseño de tarjeta — solo Entrada */}
          {activeType === 'entrada' && (
            <div className="card" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                🎨 Diseño de la Tarjeta
              </h3>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Título de la tarjeta</label>
                <input
                  type="text"
                  value={config.cardTitle || ''}
                  onChange={(e) => updateConfig('cardTitle', e.target.value)}
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Subtítulo</label>
                <input
                  type="text"
                  value={config.cardSubtitle || ''}
                  onChange={(e) => updateConfig('cardSubtitle', e.target.value)}
                  style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}
                />
              </div>

              {/* Imagen de fondo */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>Imagen de Fondo</label>
                <input id="bgImageUpload" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => { handleImageUpload(e.target.files?.[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: 10, padding: 10, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: config.bgImage ? `url(${config.bgImage}) center/cover` : 'var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
                    {!config.bgImage && '🖼️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {config.bgImage ? 'Imagen cargada' : 'Sin imagen'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                      <button
                        type="button"
                        onClick={() => document.getElementById('bgImageUpload')?.click()}
                        style={{ fontSize: 12, padding: '6px 10px', background: 'var(--border)', border: 'none', borderRadius: 6, color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Subir
                      </button>
                      {config.bgImage && (
                        <button type="button" onClick={() => updateConfig('bgImage', '')} style={{ fontSize: 12, padding: '6px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', cursor: 'pointer' }}>
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { key: 'bgColor', label: 'Color fondo' },
                  { key: 'borderColor', label: 'Borde avatar' },
                  { key: 'titleColor', label: 'Color título' },
                  { key: 'usernameColor', label: 'Color usuario' },
                  { key: 'subtitleColor', label: 'Color subtítulo' },
                ].map((c) => (
                  <div key={c.key}>
                    <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{c.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px' }}>
                      <input
                        type="color"
                        value={config[c.key] || '#ffffff'}
                        onChange={(e) => updateConfig(c.key, e.target.value)}
                        style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace' }}>{config[c.key] || '#fff'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Opacidad overlay */}
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
                  Oscuridad del overlay: {Math.round((config.overlayOpacity ?? 0.55) * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.05"
                  value={config.overlayOpacity ?? 0.55}
                  onChange={(e) => updateConfig('overlayOpacity', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* BOTONES GUARDAR */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', paddingBottom: 20 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: '0 4px 16px rgba(255,105,180,0.4)',
              WebkitTapHighlightColor: 'transparent',
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
            padding-left: max(24px, env(safe-area-inset-left)) !important;
            padding-right: max(24px, env(safe-area-inset-right)) !important;
          }
          .mobile-topbar {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          input, select, textarea {
            font-size: 16px !important;
          }
          input[type='color'] {
            font-size: initial !important;
          }
        }
        * {
          -webkit-overflow-scrolling: touch;
        }
        button, a, input[type='checkbox'] {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
