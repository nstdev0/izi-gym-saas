export function capitalizeText(text: string) {
    return text
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD") // Separa acentos de letras (ej: é -> e + ´)
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .replace(/\s+/g, "-") // Espacios a guiones
        .replace(/[^\w\-]+/g, "") // Elimina todo lo que no sea palabra o guión
        .replace(/\-\-+/g, "-"); // Elimina guiones dobles
}