'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.accessToken) {
      setLoading(true);
      fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      })
        .then(r => r.json())
        .then(data => {
          // Only guilds where user has ADMIN or MANAGE_GUILD
          const adminGuilds = (data || []).filter(g => (BigInt(g.permissions) & BigInt(0x8)) === BigInt(0x8) || (BigInt(g.permissions) & BigInt(0x20)) === BigInt(0x20));
          setGuilds(adminGuilds);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h1>🍒 Cherry</h1>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '20vh' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🍒 Cherry</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Panel de control del bot inspirado en MEE6
        </p>
        <button onClick={() => signIn('discord')} style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>
          Iniciar sesión con Discord
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>🍒 Cherry Dashboard</h1>
          <p style={{ color: 'var(--muted)' }}>Hola, {session.user?.name}</p>
        </div>
        <button className="btn-secondary" onClick={() => signOut()}>
          Cerrar sesión
        </button>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Tus servidores</h2>
      {loading ? (
        <p>Cargando servidores...</p>
      ) : guilds.length === 0 ? (
        <div className="card">
          <p>No tienes servidores con permisos de administrador, o el bot no está en ellos.</p>
          <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
            Invita el bot a tu servidor y asegúrate de tener el permiso <strong>Administrador</strong>.
          </p>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {guilds.map(g => (
            <Link key={g.id} href={`/dashboard/${g.id}`} className="guild-card">
              {g.icon ? (
                <img
                  className="guild-icon"
                  src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`}
                  alt=""
                />
              ) : (
                <div className="guild-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                  {g.name[0]}
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Configurar →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
