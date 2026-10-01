export function detectBrowser(
    userAgent: string
): string {

    const ua =
        userAgent.toLowerCase();

    if (ua.includes("edg")) {
        return "EDGE";
    }

    if (ua.includes("chrome")) {
        return "CHROME";
    }

    if (ua.includes("firefox")) {
        return "FIREFOX";
    }

    if (ua.includes("safari")) {
        return "SAFARI";
    }

    return "UNKNOWN";
}