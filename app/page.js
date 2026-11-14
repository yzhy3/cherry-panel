'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [guilds, setGuilds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugError, setDebugError] = useState(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    if (!session?.accessToken) {
      setDebugError('Falta el accessToken en la sesión. Revisa los callbacks en route.js de NextAuth y vuelve a iniciar sesión.');
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
        // Filtrar servidores donde tienes ADMINISTRATOR (0x8) o MANAGE_GUILD (0x20)
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

      {debugError && (
        <div className="card" style={{ border: '1px solid #ff4d4f', marginBottom: '1rem' }}>
          <p style={{ color: '#ff4d4f', fontWeight: 600 }}>⚠️ Diagnóstico:</p>
          <p style={{ marginTop: '0.5rem' }}>{debugError}</p>
        </div>
      )}

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
          {guilds.map((g) => (
            <Link key={g.id} href={`/dashboard/${g.id}`} className="guild-card">
              {g.icon ? (
                <img
                  className="guild-icon"
                  src={`https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128`}
                  alt=""
                />
              ) : (
                <div
                  className="guild-icon"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                >
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
