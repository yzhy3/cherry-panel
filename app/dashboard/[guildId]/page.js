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
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
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
    <div className="layout" style={{ background: 'var(--bg)' }}>
      {/* ================= SIDEBAR ================= */}
      <aside
        className="sidebar"
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
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
              }}
            >
              🍒
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Cherry</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 150,
                }}
              >
                {guildInfo.name}
              </div>
            </div>
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
              className="nav-link active"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
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
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--muted)',
          }}
        >
          ← Cambiar de servidor
        </a>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="main" style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Header del módulo */}
        <div
          className="header"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
              👋 Sistema de Bienvenida
            </h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
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
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>
              {config.enabled ? 'Activado' : 'Desactivado'}
            </span>
            <div style={{ position: 'relative', width: 40, height: 22 }}>
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
                  top: 2,
                  left: config.enabled ? 20 : 2,
                  width: 18,
                  height: 18,
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
              padding: '12px 20px',
              borderBottom: '1px solid var(--border)',
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
                padding: '6px 12px',
                background: 'var(--border)',
                borderRadius: 8,
                opacity: testing ? 0.6 : 1,
              }}
            >
              {testing ? 'Enviando...' : '🚀 Probar en Discord'}
            </button>
          </div>

          <div style={{ padding: 20, background: 'rgba(0,0,0,0.25)' }}>
            <div
              style={{
                background: '#313338',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
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
                  <p style={{ fontSize: 13, color: '#e0e0e0', marginTop: 4, margin: '4px 0 0' }}>
                    {formatPreviewText(config.message)}
                  </p>

                  {/* Tarjeta canvas */}
                  <div
                    style={{
                      position: 'relative',
                      marginTop: 12,
                      width: '100%',
                      maxWidth: 560,
                      aspectRatio: '600 / 260',
                      borderRadius: 12,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: 24,
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
                      }}
                    >
                      <img
                        src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                        alt="Avatar"
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          marginBottom: 10,
                          border: `4px solid ${config.borderColor}`,
                        }}
                      />
                      <h4
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          color: config.titleColor,
                          margin: 0,
                        }}
                      >
                        {formatPreviewText(config.cardTitle)}
                      </h4>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          marginTop: 2,
                          color: config.usernameColor,
                        }}
                      >
                        {session?.user?.name || 'Usuario#0000'}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          marginTop: 4,
                          color: config.subtitleColor,
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
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}
        >
          {/* Columna 1 */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
              💬 Canal y Mensajes
            </h3>

            <div className="form-group">
              <label>Canal de Bienvenida</label>
              <select
                value={config.channelId}
                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
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
                style={{ resize: 'none' }}
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
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Subtítulo en la imagen</label>
              <input
                type="text"
                value={config.cardSubtitle}
                onChange={(e) => setConfig({ ...config, cardSubtitle: e.target.value })}
              />
            </div>
          </div>

          {/* Columna 2 */}
          <div className="card">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
              🎨 Diseño de la Tarjeta
            </h3>

            <div className="form-group">
              <label>URL Imagen de Fondo (opcional)</label>
              <input
                type="url"
                placeholder="https://i.imgur.com/..."
                value={config.bgImage}
                onChange={(e) => setConfig({ ...config, bgImage: e.target.value })}
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
                style={{ padding: 0, accentColor: 'var(--primary)' }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div>
                <label>Color de Fondo</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg)',
                    padding: 6,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                    style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)' }}>
                    {config.bgColor}
                  </span>
                </div>
              </div>

              <div>
                <label>Borde y Nombre</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg)',
                    padding: 6,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <input
                    type="color"
                    value={config.borderColor}
                    onChange={(e) =>
                      setConfig({ ...config, borderColor: e.target.value, usernameColor: e.target.value })
                    }
                    style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)' }}>
                    {config.borderColor}
                  </span>
                </div>
              </div>

              <div>
                <label>Color Título</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg)',
                    padding: 6,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <input
                    type="color"
                    value={config.titleColor}
                    onChange={(e) => setConfig({ ...config, titleColor: e.target.value })}
                    style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)' }}>
                    {config.titleColor}
                  </span>
                </div>
              </div>

              <div>
                <label>Color Subtítulo</label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg)',
                    padding: 6,
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                  }}
                >
                  <input
                    type="color"
                    value={config.subtitleColor}
                    onChange={(e) => setConfig({ ...config, subtitleColor: e.target.value })}
                    style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--muted)' }}>
                    {config.subtitleColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Botón Guardar ===== */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 28px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
              boxShadow: '0 8px 24px rgba(255,105,180,0.3)',
              fontSize: 13,
              fontWeight: 700,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </main>
    </div>
  );
}