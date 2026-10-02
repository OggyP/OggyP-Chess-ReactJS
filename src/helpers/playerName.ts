/** Player names are often stored as `TITLE|username` (e.g. `GM|OggyP`). */

function parsePlayerName(raw: string): { title?: string; username: string } {
    const parts = raw.split('|')
    if (parts.length > 1)
        return { title: parts[0], username: parts.slice(1).join('|') }
    return { username: raw }
}

function normalizePlayerInfo<T extends { username: string; title?: string }>(player: T): T {
    if (player.title)
        return player
    const parsed = parsePlayerName(player.username)
    return { ...player, ...parsed }
}

export { parsePlayerName, normalizePlayerInfo }
