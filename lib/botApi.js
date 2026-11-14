export async function botFetch(path, options = {}) {
  const url = `/api/bot${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bot API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getGuildSettings(guildId) {
  return botFetch(`/api/guilds/${guildId}/settings`);
}

export async function updateGuildSettings(guildId, data) {
  return botFetch(`/api/guilds/${guildId}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getLeaderboard(guildId) {
  return botFetch(`/api/guilds/${guildId}/leaderboard?limit=20`);
}

export async function getChannels(guildId) {
  return botFetch(`/api/guilds/${guildId}/channels`);
}

export async function getRoles(guildId) {
  return botFetch(`/api/guilds/${guildId}/roles`);
}

export async function getTempVoice(guildId) {
  return botFetch(`/api/guilds/${guildId}/tempvoice`);
}

export async function setTempVoice(guildId, channelIds) {
  return botFetch(`/api/guilds/${guildId}/tempvoice`, {
    method: 'POST',
    body: JSON.stringify({ channelIds }),
  });
}
