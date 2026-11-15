import { NextResponse } from 'next/server';

// Devuelve solo el Client ID (Application ID) desde el servidor.
// Así el panel puede invitar al bot sin necesitar NEXT_PUBLIC_ ni que el bot esté online.
export async function GET() {
  const clientId = (
    process.env.DISCORD_CLIENT_ID ||
    process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ||
    ''
  ).trim();

  const isSnowflake = /^[0-9]{17,20}$/.test(clientId);

  return NextResponse.json({
    clientId: isSnowflake ? clientId : null,
  });
}
