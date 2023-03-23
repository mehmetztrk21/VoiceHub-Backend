export function normalizeUrlPath(path: string) {
    return path.replace(/\/+/g, "/").replace(/(^\/)|(\/$)/g, "");
}