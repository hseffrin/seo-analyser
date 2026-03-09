/**
 * Sanitiza e normaliza a URL para evitar SSRF e remover rastreamento.
 * Força HTTPS, remove parâmetros UTM e valida o formato.
 */
export function sanitizeUrl(rawUrl: string): string {
    const urlStr = rawUrl.trim();

    // Rejeita URLs que não começam com https://
    if (!urlStr.startsWith("https://")) {
        throw new Error("URL deve começar com https://");
    }

    // Rejeita URLs que fazem uso de caminhos relativos (./ ou ../)
    if (urlStr.includes("./") || urlStr.includes("../")) {
        throw new Error("Caminhos relativos (./ ou ../) não são permitidos.");
    }

    try {
        const url = new URL(urlStr);

        // Bloqueia protocolos que não sejam HTTPS
        if (url.protocol !== "https:") {
            throw new Error("Apenas o protocolo HTTPS é suportado.");
        }

        // Remove âncoras (extra)
        url.hash = "";

        // Remove parâmetros UTM
        const params = new URLSearchParams(url.search);
        const keysToRemove: string[] = [];
        params.forEach((_, key) => {
            if (key.toLowerCase().startsWith("utm_")) {
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach((key) => params.delete(key));
        url.search = params.toString();

        return url.toString();
    } catch (err) {
        throw new Error(err instanceof Error ? err.message : "URL inválida.");
    }
}

/**
 * Normaliza a URL para comparação (removendo hash).
 */
export function normalizeUrl(rawUrl: string): string {
    try {
        const url = new URL(rawUrl);
        url.hash = "";
        return url.toString();
    } catch {
        return rawUrl.trim();
    }
}
