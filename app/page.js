'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Si ya está logueado, puede ir directo al dashboard
  useEffect(() => {
    // No forzar redirect automático para que vea el home bonito
  }, [status]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* NAV */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
          background: 'rgba(15,15,19,0.85)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
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
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>Cherry</span>
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
                Ir al Dashboard
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
            El panel más bonito<br />
            para gestionar tu bot
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
            desde un dashboard intuitivo inspirado en los mejores bots.
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
                Abrir Dashboard →
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
        <h2
          style={{
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
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
            <div
              key={f.title}
              className="card"
              style={{
                padding: 20,
                transition: 'border-color 0.2s, transform 0.2s',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 16px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: 13,
        }}
      >
        Cherry Bot 🍒 · Hecho con ❤️ para Discord
      </footer>
    </div>
  );
}
