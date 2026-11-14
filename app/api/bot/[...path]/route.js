import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL;
const BOT_API_SECRET = process.env.BOT_API_SECRET || process.env.INTERNAL_API_SECRET;

export async function GET(req, { params }) {
  return handleProxy(req, params.path);
}

export async function POST(req, { params }) {
  return handleProxy(req, params.path, 'POST', await req.json().catch(() => null));
}

export async function PATCH(req, { params }) {
  return handleProxy(req, params.path, 'PATCH', await req.json().catch(() => null));
}

async function handleProxy(req, pathSegments, method = 'GET', body = null) {
  try {
    const path = '/' + (pathSegments || []).join('/');
    const url = `${BOT_API_URL}${path}${req.nextUrl.search}`;

    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': BOT_API_SECRET,
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
