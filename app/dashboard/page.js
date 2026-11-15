'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(null);
  const [needInvite, setNeedInvite] = useState(null);
  const [debugError, setDebugError] = useState(null);
  const [bot, setBot] = useState(null);

  const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '';

  useEffect(() => {
    fetch('/api/bot/api/bot')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.avatar) setBot(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      signIn('discord', { callbackUrl: '/dashboard' });
      return;
    }

    if (!session?.accessToken) {
      setDebugError('Falta el accessToken. Vuelve a iniciar sesión.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setDebugError(null);

    fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !Array.isArray(data)) {
          throw new Error(data?.message || `Error de Discord (${r.status})`);
        }
        const adminGuilds = data.filter(
          (g) =>
            (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8) ||
            (BigInt(g.permissions) & BigInt(0x20)) === BigInt(0x20)
        );
        setGuilds(adminGuilds);
      })
      .catch((err) => {
        console.error(err);
        setDebugError(err.message);
      })
      .finally(() => setLoading(false));
  }, [session, status]);

  const handleConfigure = async (guild) => {
    setChecking(guild.id);
    setNeedInvite(null);

    try {
      let res = await fetch(`/api/bot/api/guilds/${guild.id}/status`);
      if (res.ok) {
        const data = await res.json();
        if (data.present) {
          router.push(`/dashboard/${guild.id}`);
          return;
        }
      }
      res = await fetch(`/api/bot/api/guilds/${guild.id}/avisos`);
      if (res.ok) {
        router.push(`/dashboard/${guild.id}`);
        return;
      }
      setNeedInvite(guild);
    } catch {
      setNeedInvite(guild);
    } finally {
      setChecking(null);
    }
  };

  const getInviteUrl = (guildId) => {
    const perms = '8';
    const clientId = CLIENT_ID || bot?.id || '';
    if (!clientId) return 'https://discord.com/oauth2/authorize?scope=bot%20applications.commands';
    return `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${perms}&scope=bot%20applications.commands&guild_id=${guildId || ''}&disable_guild_select=${guildId ? 'true' : 'false'}`;
  };

  const BotIcon = ({ size = 36 }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: bot?.avatar ? 'transparent' : 'linear-gradient(135deg, #ff69b4, #ff85c2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(255,105,180,0.35)',
      }}
    >
      {bot?.avatar ? (
        <img src={bot.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        '🍒'
      )}
    </div>
  );

  if (status === 'loading' || (status === 'authenticated' && loading)) {
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
        <BotIcon size={48} />
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Cargando tus servidores...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit' }}>
            <BotIcon size={36} />
            <span style={{ fontWeight: 700 }}>{bot?.username || 'Cherry'}</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {session?.user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
                {session.user.image && (
                  <img src={session.user.image} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />
                )}
                <span className="hide-mobile">{session.user.name}</span>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="btn-secondary"
              style={{ fontSize: 13, padding: '8px 14px' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Gestionar servidores</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            Selecciona un servidor para configurar. Solo aparecen aquellos donde tienes permisos de administrador.
          </p>
        </div>

        {debugError && (
          <div className="card" style={{ border: '1px solid #ff4d4f', marginBottom: 20 }}>
            <p style={{ color: '#ff4d4f', fontWeight: 600 }}>⚠️ Error</p>
            <p style={{ marginTop: 6, fontSize: 14 }}>{debugError}</p>
          </div>
        )}

        {needInvite && (
          <div
            className="card"
            style={{
              marginBottom: 24,
              border: '1px solid var(--primary)',
              background: 'rgba(255,105,180,0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {needInvite.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${needInvite.id}/${needInvite.icon}.png?size=64`}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: 12 }}
                />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {needInvite.name?.[0]}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                  {bot?.username || 'Cherry'} no está en <strong>{needInvite.name}</strong>
                </h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                  Invita el bot al servidor y vuelve a hacer clic en <strong>Configurar</strong>.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href={getInviteUrl(needInvite.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      padding: '10px 18px',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      display: 'inline-block',
                    }}
                  >
                    ➕ Añadir bot al servidor
                  </a>
                  <button
                    onClick={() => setNeedInvite(null)}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: 14 }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {guilds.length === 0 && !loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No hay servidores disponibles</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 400, margin: '0 auto 20px' }}>
              No tienes servidores con permisos de Administrador, o aún no has invitado al bot.
            </p>
            <a
              href={getInviteUrl('')}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--primary)',
                color: '#fff',
                padding: '12px 22px',
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                display: 'inline-block',
              }}
            >
              Invitar bot a un servidor
            </a>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 14,
            }}
          >
            {guilds.map((g) => (
              <div
                key={g.id}
                className="guild-card"
                onClick={() => handleConfigure(g)}
                style={{
                  cursor: checking === g.id ? 'wait' : 'pointer',
                  opacity: checking === g.id ? 0.7 : 1,
                  border: needInvite?.id === g.id ? '1px solid var(--primary)' : undefined,
                }}
              >
                {g.icon ? (
                  <img
                    className="guild-icon"
                    src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`}
                    alt=""
                  />
                ) : (
                  <div
                    className="guild-icon"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                    }}
                  >
                    {g.name[0]}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {checking === g.id ? 'Comprobando...' : 'Configurar →'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
