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
      <div className="min-h-screen bg-[#0b0c0f] text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,92,138,0.12),transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-2xl shadow-lg shadow-pink-500/30 animate-pulse">
            🍒
          </div>
          <p className="text-sm text-gray-400 tracking-wide">Cargando panel de Cherry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c0f] text-gray-100 relative">
      {/* Glow de fondo global tipo Koya */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-pink-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative flex">
        {/* ================= SIDEBAR ================= */}
        <aside className="hidden md:flex w-[260px] min-h-screen flex-col justify-between p-4 border-r border-white/[0.06] bg-[#0f1013]/80 backdrop-blur-xl sticky top-0 h-screen">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 px-2 py-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-lg shadow-lg shadow-pink-500/30">
                🍒
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white leading-tight">Cherry</h1>
                <span className="text-[11px] text-gray-500 truncate block max-w-[150px]">
                  {guildInfo.name}
                </span>
              </div>
            </div>

            {/* Nav */}
            <div className="px-2 mb-2">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.12em] mb-2">
                Módulos
              </p>
            </div>
            <nav className="space-y-0.5 px-2">
              <button className="group w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-[13px] font-medium transition">
                <span className="text-sm">👋</span>
                <span>Bienvenidas</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(255,92,138,0.8)]" />
              </button>
            </nav>
          </div>

          {/* Footer sidebar */}
          <div className="px-2">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-xs">
                  {session?.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-white truncate">
                    {session?.user?.name || 'Usuario'}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {guildInfo.name}
                  </p>
                </div>
              </div>
            </div>
            <a
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-gray-400 hover:text-white hover:bg-white/[0.04] transition"
            >
              ← Cambiar de servidor
            </a>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="flex-1 min-w-0">
          {/* Top bar sticky */}
          <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0b0c0f]/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[12px] text-gray-500">
                <span>Dashboard</span>
                <span className="text-gray-700">/</span>
                <span className="text-gray-300">Bienvenidas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/[0.03] border border-white/[0.06] rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Bot conectado
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-xs font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-10 space-y-6">
            {/* Header módulo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-medium text-pink-400/80 mb-1.5">
                  <span className="w-1 h-1 rounded-full bg-pink-400" />
                  Módulo activo
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight flex items-center gap-2">
                  👋 Sistema de Bienvenida
                </h2>
                <p className="text-[13px] text-gray-500 mt-1.5 max-w-xl">
                  Recibe a los nuevos miembros con una tarjeta personalizada estilo Koya.
                </p>
              </div>

              {/* Toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 hover:bg-white/[0.05] transition">
                <span className="text-[12px] font-medium text-gray-300">
                  {config.enabled ? 'Activado' : 'Desactivado'}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-[22px] rounded-full bg-white/[0.08] peer-checked:bg-pink-500/80 transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-[18px]" />
                </div>
              </label>
            </div>

            {/* ===== Vista previa ===== */}
            <section className="relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.01] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <h3 className="text-[12px] font-medium text-gray-300">
                    Vista Previa en Vivo
                  </h3>
                </div>
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg px-3 py-1.5 transition disabled:opacity-50"
                >
                  {testing ? 'Enviando...' : '🚀 Probar en Discord'}
                </button>
              </div>

              {/* Chat simulado */}
              <div className="p-5 md:p-6 bg-[#1e1f22]/60">
                <div className="bg-[#313338] rounded-xl p-4 border border-black/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center text-sm shrink-0">
                      🍒
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-[13px]">Cherry</span>
                        <span className="bg-[#5865f2] text-[9px] font-bold px-1.5 py-[2px] rounded text-white tracking-wide">
                          BOT
                        </span>
                        <span className="text-[10px] text-gray-400">hoy a las 12:00</span>
                      </div>
                      <p className="text-[13px] text-gray-200 mt-1 leading-relaxed">
                        {formatPreviewText(config.message)}
                      </p>

                      {/* Tarjeta canvas */}
                      <div
                        className="relative mt-3 w-full max-w-[560px] aspect-[600/260] rounded-xl overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-2xl ring-1 ring-white/10"
                        style={{
                          backgroundColor: config.bgColor,
                          backgroundImage: config.bgImage ? `url(${config.bgImage})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div
                          className="absolute inset-0 transition-all"
                          style={{ backgroundColor: `rgba(0,0,0,${config.overlayOpacity})` }}
                        />
                        <div className="relative z-10 flex flex-col items-center">
                          <img
                            src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                            alt="Avatar"
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover mb-3 shadow-lg"
                            style={{ border: `4px solid ${config.borderColor}` }}
                          />
                          <h4
                            className="text-xl md:text-2xl font-extrabold tracking-wide uppercase"
                            style={{ color: config.titleColor }}
                          >
                            {formatPreviewText(config.cardTitle)}
                          </h4>
                          <p
                            className="text-base md:text-lg font-bold mt-0.5"
                            style={{ color: config.usernameColor }}
                          >
                            {session?.user?.name || 'Usuario#0000'}
                          </p>
                          <p
                            className="text-[12px] md:text-sm mt-1"
                            style={{ color: config.subtitleColor }}
                          >
                            {formatPreviewText(config.cardSubtitle)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ===== Formularios ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Columna 1 */}
              <section className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-5 md:p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-sm">💬</span>
                  <h3 className="text-[14px] font-semibold text-white">Canal y Mensajes</h3>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Canal de Bienvenida
                  </label>
                  <select
                    value={config.channelId}
                    onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                    className="w-full bg-[#0b0c0f] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition"
                  >
                    <option value="">Selecciona un canal...</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        # {ch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Mensaje de texto
                  </label>
                  <textarea
                    rows={2}
                    value={config.message}
                    onChange={(e) => setConfig({ ...config, message: e.target.value })}
                    className="w-full bg-[#0b0c0f] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition resize-none"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 inline-block">
                    Variables: <code className="text-pink-400/90">{'{user}'}</code>,{' '}
                    <code className="text-pink-400/90">{'{server}'}</code>,{' '}
                    <code className="text-pink-400/90">{'{count}'}</code>
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Título en la imagen
                  </label>
                  <input
                    type="text"
                    value={config.cardTitle}
                    onChange={(e) => setConfig({ ...config, cardTitle: e.target.value })}
                    className="w-full bg-[#0b0c0f] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Subtítulo en la imagen
                  </label>
                  <input
                    type="text"
                    value={config.cardSubtitle}
                    onChange={(e) => setConfig({ ...config, cardSubtitle: e.target.value })}
                    className="w-full bg-[#0b0c0f] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-white focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition"
                  />
                </div>
              </section>

              {/* Columna 2 */}
              <section className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.035] to-white/[0.01] p-5 md:p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-sm">🎨</span>
                  <h3 className="text-[14px] font-semibold text-white">Diseño de la Tarjeta</h3>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    URL Imagen de Fondo <span className="text-gray-600">(opcional)</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://i.imgur.com/..."
                    value={config.bgImage}
                    onChange={(e) => setConfig({ ...config, bgImage: e.target.value })}
                    className="w-full bg-[#0b0c0f] border border-white/[0.08] rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                      Oscuridad del fondo
                    </label>
                    <span className="text-[11px] font-mono text-pink-400">
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
                    className="w-full accent-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { label: 'Color de Fondo', key: 'bgColor' },
                    { label: 'Borde y Nombre', key: 'borderColor' },
                    { label: 'Color Título', key: 'titleColor' },
                    { label: 'Color Subtítulo', key: 'subtitleColor' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-[11px] font-medium text-gray-400 mb-1.5">
                        {label}
                      </label>
                      <div className="flex items-center gap-2 bg-[#0b0c0f] p-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.15] transition">
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
                          className="w-7 h-7 rounded-md cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[10px] font-mono text-gray-400 truncate">
                          {config[key]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Barra flotante de Guardar */}
            <div className="sticky bottom-4 z-10">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#0f1013]/90 backdrop-blur-xl px-4 py-3 shadow-2xl shadow-black/40">
                <p className="text-[12px] text-gray-500 hidden sm:block">
                  Los cambios se sincronizan con Cherry al guardar.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white text-[13px] font-semibold shadow-lg shadow-pink-500/25 transition disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>💾 Guardar Cambios</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}