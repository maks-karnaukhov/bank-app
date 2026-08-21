export const isValidHexColor = (
    color: string
) => {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
};