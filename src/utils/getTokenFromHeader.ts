export function getTokenFromHeader(header: string) {
    if (header && header.startsWith('Bearer ')) {
        return header.slice(7, header.length);
    }
    return null;
}