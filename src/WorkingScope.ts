export type WorkingScope = 'development' | 'production';

export function getWorkingScope() {
    return process.env.SCOPE || process.env.Scope || 'development';
}