// app/api/bot/api/guilds/[guildId]/welcome/upload/route.js
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req, { params }) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return Response.json({ error: 'No file' }, { status: 400 });
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  
  const ext = file.name.split('.').pop();
  const filename = `bg-${params.guildId}-${Date.now()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);
  
  return Response.json({ url: `/uploads/${filename}` });
}