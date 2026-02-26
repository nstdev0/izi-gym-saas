const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const generateMemberQrToken = (): string => {
    let id = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const randomValues = new Uint8Array(16);
        crypto.getRandomValues(randomValues);
        for (let i = 0; i < 16; i++) {
            id += alphabet[randomValues[i] % alphabet.length];
        }
    } else {
        for (let i = 0; i < 16; i++) {
            id += alphabet[Math.floor(Math.random() * alphabet.length)];
        }
    }
    return `mem_${id}`;
};