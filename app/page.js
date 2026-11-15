'use client';

import { useSession, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [bot, setBot] = useState(null);

  useEffect(() => {
    // Intentamos cargar el avatar real del bot desde la API
    fetch('/api/bot/api/bot')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.avatar) setBot(data);
      })
      .catch(() => {});
  }, []);

  const BotIcon = ({ size = 36 }) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size > 40 ? 16 : 10,
        background: bot?.avatar
          ? 'transparent'
          : 'linear-gradient(135deg, #ff69b4, #ff85c2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
        boxShadow: '0 4px 14px rgba(255,105,180,0.35)',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {bot?.avatar ? (
        <img
          src={bot.avatar}
          alt={bot.username || 'Cherry'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        '🍒'
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* NAV */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'rgba(15,15,19,0.85)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BotIcon size={36} />
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
              {bot?.username || 'Cherry'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {status === 'authenticated' ? (
              <Link
                href="/dashboard"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: '0 4px 14px rgba(255,105,180,0.3)',
                }}
              >
                Gestionar servidores
              </Link>
            ) : (
              <button
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255,105,180,0.3)',
                }}
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          padding: '80px 16px 60px',
          textAlign: 'center',
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,105,180,0.18), transparent)',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <BotIcon size={80} />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,105,180,0.12)',
              border: '1px solid rgba(255,105,180,0.25)',
              borderRadius: 999,
              padding: '6px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--primary)',
              marginBottom: 24,
            }}
          >
            ✨ Bot multipropósito para Discord
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 6vw, 48px)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 16,
              letterSpacing: '-0.03em',
            }}
          >
            Gestiona tu servidor<br />
            de forma fácil y bonita
          </h1>

          <p
            style={{
              fontSize: 'clamp(15px, 2.5vw, 18px)',
              color: 'var(--muted)',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Configura avisos de entrada, salida, bans, boosts y mucho más
            desde un panel intuitivo inspirado en los mejores bots.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {status === 'authenticated' ? (
              <Link
                href="/dashboard"
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  boxShadow: '0 6px 20px rgba(255,105,180,0.4)',
                }}
              >
                Gestionar servidores →
              </Link>
            ) : (
              <button
                onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(255,105,180,0.4)',
                }}
              >
                Iniciar sesión con Discord
              </button>
            )}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '40px 16px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, marginBottom: 32 }}>
          Todo lo que necesitas
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {[
            { icon: '👋', title: 'Avisos de Entrada', desc: 'Tarjetas personalizadas cuando alguien se une a tu servidor.' },
            { icon: '🚪', title: 'Avisos de Salida', desc: 'Notifica cuando un miembro abandona el servidor.' },
            { icon: '🔨', title: 'Avisos de Ban', desc: 'Mantén un registro visible de los bans aplicados.' },
            { icon: '🚀', title: 'Avisos de Boost', desc: 'Agradece automáticamente a quien impulse el servidor.' },
            { icon: '🎨', title: 'Diseño personalizado', desc: 'Colores, fondos e imágenes a tu gusto, estilo Koya.' },
            { icon: '⚡', title: 'Fácil y rápido', desc: 'Configura todo desde el panel sin tocar comandos.' },
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: 13,
        }}
      >
        {bot?.username || 'Cherry'} · Hecho con ❤️ para Discord
      </footer>
    </div>
  );
}
