export function detectDeviceType(
    userAgent: string
): string {

    const ua =
        userAgent.toLowerCase();

    if (
        ua.includes("mobile")
    ) {
        return "MOBILE";
    }

    if (
        ua.includes("tablet")
    ) {
        return "TABLET";
    }

    return "DESKTOP";
}