export default function formatDuration(days: number) {
    if (days === 1) return "1 día";
    if (days === 7) return "1 semana";
    if (days === 30) return "1 mes";
    if (days === 90) return "3 meses";
    if (days === 180) return "6 meses";
    if (days === 365) return "1 año";
    return `${days} días`;
};