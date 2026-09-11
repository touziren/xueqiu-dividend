export function formatDateTime(timestamp) {
    if (!timestamp) {
        return '--'
    }

    const date = new Date(timestamp)

    const pad = (num) => String(num).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatPercent(value, digits = 2) {
    if (value === null || value === undefined) {
        return '-';
    }

    return (Number(value) * 100)
        .toFixed(digits)
        .replace(/\.?0+$/, '') + '%';
}