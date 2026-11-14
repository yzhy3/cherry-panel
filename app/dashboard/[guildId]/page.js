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
      <div className="min-h-screen bg-[#111214] text-white flex items-center justify-center">
        <div className="animate-pulse text-pink-500 font-semibold text-lg">Cargando panel de Cherry...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111214] text-gray-100 flex">
      {/* Sidebar estilo Koya.gg */}
      <aside className="w-64 bg-[#18191c] border-r border-white/5 p-5 hidden md:flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-pink-500/20">
              🍒
            </div>
            <div>
              <h1 className="font-bold text-white leading-tight">Cherry</h1>
              <span className="text-xs text-gray-400 truncate block max-w-[140px]">{guildInfo.name}</span>
            </div>
          </div>

          <nav className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Módulos</div>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-pink-500/15 text-pink-400 font-medium text-sm border border-pink-500/20">
              <span>👋</span> Bienvenidas
            </button>
          </nav>
        </div>

        <a href="/dashboard" className="text-xs text-gray-400 hover:text-white transition px-3 py-2">
          ← Cambiar de servidor
        </a>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header del módulo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18191c] p-6 rounded-2xl border border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              👋 Sistema de Bienvenida
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Recibe a los nuevos miembros con una tarjeta personalizada estilo Koya.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gray-300">
                {config.enabled ? 'Activado' : 'Desactivado'}
              </span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 accent-pink-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Vista Previa en Tiempo Real (Estilo Koya.gg Profesional) */}
        <div className="bg-[#18191c] p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              Vista Previa en Vivo (Estilo Koya)
            </h3>
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-xs font-semibold text-pink-400 border border-pink-500/20 transition shadow-sm"
            >
              {testing ? 'Enviando...' : '🚀 Probar en Discord'}
            </button>
          </div>

          {/* Simulación de mensaje de Discord */}
          <div className="bg-[#2b2d31] p-4 sm:p-5 rounded-2xl space-y-4 border border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-400 flex items-center justify-center font-bold text-white shadow-md shrink-0">
                🍒
              </div>
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">Cherry</span>
                  <span className="bg-[#5865f2] text-[10px] font-extrabold px-1.5 py-0.5 rounded text-white tracking-wide">BOT</span>
                  <span className="text-xs text-gray-400">Hoy a las 2:12 p. m.</span>
                </div>
                <p className="text-sm text-gray-200 font-medium">{formatPreviewText(config.message)}</p>
              </div>
            </div>

            {/* Tarjeta Canvas Estilo Koya.gg (Responsive y Limpia) */}
            <div
              className="relative w-full aspect-[8/3.5] min-h-[240px] rounded-2xl overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-2xl transition-all border border-white/10"
              style={{
                backgroundColor: config.bgColor || '#1e1f22',
                backgroundImage: config.bgImage ? `url(${config.bgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* Overlay oscuro translúcido estilo Koya */}
              <div
                className="absolute inset-0 transition-all pointer-events-none"
                style={{ backgroundColor: `rgba(0, 0, 0, ${config.overlayOpacity ?? 0.55})` }}
              />

              {/* Contenido Interno de la Tarjeta */}
              <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto w-full">
                {/* Contenedor del Avatar perfectamente circular */}
                <div 
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 shadow-xl mb-3 flex items-center justify-center bg-[#18191c]/80 backdrop-blur-md shrink-0"
                  style={{ border: `3px solid ${config.borderColor || '#ff5c8a'}` }}
                >
                  <img
                    src={session?.user?.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Título Principal */}
                <h4
                  className="text-xl sm:text-2xl font-black tracking-wider uppercase drop-shadow-md"
                  style={{ color: config.titleColor || '#ffffff' }}
                >
                  {formatPreviewText(config.cardTitle)}
                </h4>

                {/* Nombre de Usuario */}
                <p
                  className="text-base sm:text-lg font-bold mt-0.5 drop-shadow"
                  style={{ color: config.usernameColor || '#ff5c8a' }}
                >
                  {session?.user?.name || 'Usuario#0000'}
                </p>

                {/* Subtítulo / Contador */}
                <p
                  className="text-xs sm:text-sm font-medium mt-1.5 opacity-90 drop-shadow"
                  style={{ color: config.subtitleColor || '#d1d5db' }}
                >
                  {formatPreviewText(config.cardSubtitle)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Personalización */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columna 1: Canal y Textos */}
          <div className="bg-[#18191c] p-6 rounded-2xl border border-white/5 space-y-5">
            <h3 className="font-semibold text-white text-lg">Canal y Mensajes</h3>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Canal de Bienvenida</label>
              <select
                value={config.channelId}
                onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
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
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Mensaje de texto (fuera de la imagen)
              </label>
              <textarea
                rows={2}
                value={config.message}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
              <span className="text-[11px] text-gray-500">Variables: {'{user}'}, {'{server}'}, {'{count}'}</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Título en la imagen</label>
              <input
                type="text"
                value={config.cardTitle}
                onChange={(e) => setConfig({ ...config, cardTitle: e.target.value })}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Subtítulo en la imagen</label>
              <input
                type="text"
                value={config.cardSubtitle}
                onChange={(e) => setConfig({ ...config, cardSubtitle: e.target.value })}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Columna 2: Apariencia y Colores */}
          <div className="bg-[#18191c] p-6 rounded-2xl border border-white/5 space-y-5">
            <h3 className="font-semibold text-white text-lg">Diseño de la Tarjeta</h3>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">URL Imagen de Fondo (Opcional)</label>
              <input
                type="url"
                placeholder="https://i.imgur.com/..."
                value={config.bgImage}
                onChange={(e) => setConfig({ ...config, bgImage: e.target.value })}
                className="w-full bg-[#111214] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Oscuridad del fondo ({Math.round(config.overlayOpacity * 100)}%)
              </label>
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

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Color de Fondo</label>
                <div className="flex items-center gap-2 bg-[#111214] p-2 rounded-xl border border-white/10">
                  <input
                    type="color"
                    value={config.bgColor}
                    onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-300">{config.bgColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Borde y Nombre</label>
                <div className="flex items-center gap-2 bg-[#111214] p-2 rounded-xl border border-white/10">
                  <input
                    type="color"
                    value={config.borderColor}
                    onChange={(e) =>
                      setConfig({ ...config, borderColor: e.target.value, usernameColor: e.target.value })
                    }
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-300">{config.borderColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Color Título</label>
                <div className="flex items-center gap-2 bg-[#111214] p-2 rounded-xl border border-white/10">
                  <input
                    type="color"
                    value={config.titleColor}
                    onChange={(e) => setConfig({ ...config, titleColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-300">{config.titleColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Color Subtítulo</label>
                <div className="flex items-center gap-2 bg-[#111214] p-2 rounded-xl border border-white/10">
                  <input
                    type="color"
                    value={config.subtitleColor}
                    onChange={(e) => setConfig({ ...config, subtitleColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-gray-300">{config.subtitleColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra flotante de Guardar */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-semibold shadow-lg shadow-pink-500/25 transition disabled:opacity-50"
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </main>
    </div>
  );
}
