'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function GuildDashboard() {
  const { guildId } = useParams();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [channels, setChannels] = useState([]);
  const [guildInfo, setGuildInfo] = useState({ name: 'Mi Servidor', memberCount: 120 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [config, setConfig] = useState({
    enabled: true,
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
  });

  useEffect(() => {
    if (!guildId) return;
    fetch(`/api/bot/api/guilds/${guildId}/welcome`)
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
        if (data.channels) setChannels(data.channels);
        setGuildInfo({
          name: data.guildName || 'Servidor',
          memberCount: data.memberCount || 1,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [guildId]);

  // Bloquear scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/bot/api/guilds/${guildId}/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    alert('✅ Configuración guardada y sincronizada con Cherry.');
  };

  const handleTest = async () => {
    setTesting(true);
    await fetch(`/api/bot/api/guilds/${guildId}/welcome/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: session?.user?.id || session?.user?.sub,
        config,
      }),
    });
    setTesting(false);
    alert('🚀 ¡Mensaje de bienvenida de prueba enviado a Discord!');
  };

  const formatPreviewText = (text) => {
    return (text || '')
      .replace('{user}', session?.user?.name || 'Usuario')
      .replace('{server}', guildInfo.name)
      .replace('{count}', guildInfo.memberCount);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #ff69b4, #ff85c2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 8px 24px rgba(255,105,180,0.35)',
          }}
        >
          🍒
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Cargando panel de Cherry...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* ========== OVERLAY MÓVIL ========== */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ========== SIDEBAR ========== */}
      <aside
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
        }}
        className="cherry-sidebar"
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #ff69b4, #ff85c2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                boxShadow: '0 4px 14px rgba(255,105,180,0.35)',
                flexShrink: 0,
              }}
            >
              🍒
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Cherry</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 140,
                }}
              >
                {guildInfo.name}
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Cerrar menú"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--muted)',
                fontSize: 22,
                cursor: 'pointer',
                padding: 4,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 10,
              padding: '0 8px',
            }}
          >
            Módulos
          </p>

          <nav>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px',
                borderRadius: 8,
                background: 'rgba(255,105,180,0.15)',
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <span>👋</span>
              <span>Bienvenidas</span>
              <span
                style={{
                  marginLeft: 'auto',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  boxShadow: '0 0 8px var(--primary)',
                }}
              />
            </div>
          </nav>
        </div>

        <a
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
        </a>
      </aside>

      {/* ========== MAIN ========== */}
      <main
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
        className="cherry-main"
      >
        {/* ========== TOPBAR MÓVIL ========== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
          className="mobile-topbar"
        >
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
            }}
          >
            ☰
          </button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                color: 'var(--muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {guildInfo.name}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Bienvenidas</div>
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff69b4, #ff85c2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {session?.user?.name?.[0]?.toUpperCase() || '?'}
          </div>
        </div>

        {/* Header del módulo */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, marginBottom: 4 }}>
              👋 Sistema de Bienvenida
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>
              Recibe a los nuevos miembros con una tarjeta personalizada.
            </p>
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
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {config.enabled ? 'Activado' : 'Desactivado'}
            </span>
            <div style={{ position: 'relative', width: 44, height: 26 }}>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                style={{
                  opacity: 0,
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  cursor: 'pointer',
                  position: 'absolute',
                  zIndex: 2,
                  inset: 0,
                }}
              />
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 999,
                  background: config.enabled ? 'var(--primary)' : 'var(--border)',
                  transition: 'background 0.2s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: config.enabled ? 21 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </label>
        </div>

        {/* ===== Vista previa ===== */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', margin: 0 }}>
              Vista Previa en Vivo
            </h3>
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
              }}
            >
              {testing ? 'Enviando...' : '🚀 Probar en Discord'}
            </button>
          </div>

          <div style={{ padding: 12, background: 'rgba(0,0,0,0.25)' }}>
            <div
              style={{
                background: '#313338',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff69b4, #ff85c2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  🍒
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>Cherry</span>
                    <span
                      style={{
                        background: '#5865f2',
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        color: '#fff',
                      }}
                    >
                      BOT
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#e0e0e0', margin: '4px 0 0', wordBreak: 'break-word' }}>
                    {formatPreviewText(config.message)}
                  </p>

                  {/* Tarjeta canvas */}
                  <div
                    style={{
                      position: 'relative',
                      marginTop: 12,
                      width: '100%',
                      aspectRatio: '600 / 260',
                      borderRadius: 12,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: 16,
                      backgroundColor: config.bgColor,
                      backgroundImage: config.bgImage ? `url(${config.bgImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `rgba(0,0,0,${config.overlayOpacity})`,
                      }}
                    />
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        maxWidth: '100%',
                      }}
                    >
                      <img
                        src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt="Avatar"
                        style={{
                          width: 'clamp(56px, 14vw, 88px)',
                          height: 'clamp(56px, 14vw, 88px)',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: 8,
                          border: `3px solid ${config.borderColor}`,
                        }}
                      />
                      <h4
                        style={{
                          fontSize: 'clamp(14px, 3.5vw, 22px)',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          color: config.titleColor,
                          margin: 0,
                          lineHeight: 1.1,
                          wordBreak: 'break-word',
                        }}
                      >
                        {formatPreviewText(config.cardTitle)}
                      </h4>
                      <p
                        style={{
                          fontSize: 'clamp(12px, 2.8vw, 16px)',
                          fontWeight: 700,
                          marginTop: 2,
                          color: config.usernameColor,
                          wordBreak: 'break-word',
                        }}
                      >
                        {session?.user?.name || 'Usuario#0000'}
                      </p>
                      <p
                        style={{
                          fontSize: 'clamp(10px, 2.4vw, 13px)',
                          marginTop: 4,
                          color: config.subtitleColor,
                          wordBreak: 'break-word',
                        }}
                      >
                        {formatPreviewText(config.cardSubtitle)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Formularios ===== */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 16,
          }}
        >
          {/* Columna 1 */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              💬 Canal y Mensajes
            </h3>

            <div className="form-group">
              <label>Canal de Bienvenida</label>
              <select
                value={config.channelId}
                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                style={{ fontSize: 16 }} // Evita zoom en iOS
              >
                <option value="">Selecciona un canal...</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    # {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Mensaje de texto</label>
              <textarea
                rows={2}
                value={config.message}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                style={{ resize: 'none', fontSize: 16 }} // Evita zoom iOS
              />
              <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, display: 'inline-block' }}>
                Variables: {'{user}'}, {'{server}'}, {'{count}'}
              </span>
            </div>

            <div className="form-group">
              <label>Título en la imagen</label>
              <input
                type="text"
                value={config.cardTitle}
                onChange={(e) => setConfig({ ...config, cardTitle: e.target.value })}
                style={{ fontSize: 16 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Subtítulo en la imagen</label>
              <input
                type="text"
                value={config.cardSubtitle}
                onChange={(e) => setConfig({ ...config, cardSubtitle: e.target.value })}
                style={{ fontSize: 16 }}
              />
            </div>
          </div>

          {/* Columna 2 */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
              🎨 Diseño de la Tarjeta
            </h3>

            <div className="form-group">
              <label>URL Imagen de Fondo (opcional)</label>
              <input
                type="url"
                placeholder="https://i.imgur.com/..."
                value={config.bgImage}
                onChange={(e) => setConfig({ ...config, bgImage: e.target.value })}
                style={{ fontSize: 16 }}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ marginBottom: 0 }}>Oscuridad del fondo</label>
                <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                  {Math.round(config.overlayOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={config.overlayOpacity}
                onChange={(e) => setConfig({ ...config, overlayOpacity: parseFloat(e.target.value) })}
                style={{ padding: 0, accentColor: 'var(--primary)', minHeight: 36 }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: 12,
              }}
            >
              {[
                { label: 'Color de Fondo', key: 'bgColor' },
                { label: 'Borde y Nombre', key: 'borderColor' },
                { label: 'Color Título', key: 'titleColor' },
                { label: 'Color Subtítulo', key: 'subtitleColor' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label>{label}</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'var(--bg)',
                      padding: 6,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      minHeight: 44,
                    }}
                  >
                    <input
                      type="color"
                      value={config[key]}
                      onChange={(e) => {
                        if (key === 'borderColor') {
                          setConfig({
                            ...config,
                            borderColor: e.target.value,
                            usernameColor: e.target.value,
                          });
                        } else {
                          setConfig({ ...config, [key]: e.target.value });
                        }
                      }}
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontFamily: 'monospace',
                        color: 'var(--muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {config[key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Botón Guardar ===== */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              maxWidth: 320,
              padding: '14px 28px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              boxShadow: '0 8px 24px rgba(255,105,180,0.3)',
              fontSize: 14,
              fontWeight: 700,
              opacity: saving ? 0.6 : 1,
              minHeight: 48,
              WebkitTapHighlightColor: 'transparent',
            }}
            className="save-btn"
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </main>

      {/* ========== ESTILOS RESPONSIVE + SAFE AREA ========== */}
      <style jsx global>{`
        /* Desktop: sidebar siempre visible */
        @media (min-width: 768px) {
          .cherry-sidebar {
            position: sticky !important;
            transform: translateX(0) !important;
            height: 100vh !important;
            top: 0 !important;
          }
          .cherry-sidebar button[aria-label='Cerrar menú'] {
            display: none !important;
          }
          .mobile-topbar {
            display: none !important;
          }
          .cherry-main {
            padding: 32px !important;
          }
          .save-btn {
            width: auto !important;
          }
        }

        /* Móvil: sidebar deslizable */
        @media (max-width: 767px) {
          .cherry-main {
            padding: 16px !important;
            padding-top: calc(16px + env(safe-area-inset-top)) !important;
            padding-bottom: calc(20px + env(safe-area-inset-bottom)) !important;
            padding-left: max(16px, env(safe-area-inset-left)) !important;
            padding-right: max(16px, env(safe-area-inset-right)) !important;
          }
        }

        /* Fix iOS: 100dvh en Safari antiguo */
        @supports (-webkit-touch-callout: none) {
          .cherry-sidebar {
            height: -webkit-fill-available;
          }
        }

        /* Prevenir zoom automático en iOS en inputs (font-size >= 16px) */
        @media (max-width: 767px) {
          input,
          select,
          textarea {
            font-size: 16px !important;
          }
          input[type='color'] {
            font-size: initial !important;
          }
        }

        /* Scroll suave táctil */
        * {
          -webkit-overflow-scrolling: touch;
        }

        /* Previene el highlight azul del tap en Android/iOS */
        button,
        a,
        input[type='checkbox'] {
          -webkit-tap-highlight-color: transparent;
        }

        /* Scrollbar móvil más fina */
        @media (max-width: 767px) {
          ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
        }
      `}</style>
    </div>
  );
}