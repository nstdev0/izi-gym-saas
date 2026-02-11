import { customAlphabet } from 'nanoid';

// Definimos un alfabeto seguro para URLs y fácil de leer (sin I, l, O, 0 si quisieras imprimirlo textualmente)
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// Creamos un generador de 16 caracteres.
// 16 caracteres con este alfabeto te da una seguridad de colisión casi imposible para un SaaS.
const nanoid = customAlphabet(alphabet, 16);

export const generateMemberQrToken = (): string => {
    // Agregamos un prefijo para identificar visualmente qué tipo de token es en la DB
    return `mem_${nanoid()}`;
};