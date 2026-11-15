import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f13',
        color: '#f0f0f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: 'linear-gradient(135deg, #ff69b4, #ff85c2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 24,
          boxShadow: '0 12px 32px rgba(255,105,180,0.35)',
        }}
      >
        🍒
      </div>

      <h1 style={{ fontSize: 72, fontWeight: 800, margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
        404
      </h1>
      <p style={{ fontSize: 18, color: '#a0a0b0', marginTop: 12, marginBottom: 8 }}>
        Página no encontrada
      </p>
      <p style={{ fontSize: 14, color: '#6b6b7b', maxWidth: 360, marginBottom: 32, lineHeight: 1.5 }}>
        La ruta que buscas no existe o ha sido movida.
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            background: '#ff69b4',
            color: '#fff',
            padding: '12px 22px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(255,105,180,0.35)',
          }}
        >
          Ir al inicio
        </Link>
        <Link
          href="/dashboard"
          style={{
            background: '#2a2a35',
            color: '#f0f0f5',
            padding: '12px 22px',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Gestionar servidores
        </Link>
      </div>
    </div>
  );
}
