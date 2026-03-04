import { sanitizeUrl } from "../src/utils/url";

describe("URL Validation (Back-end)", () => {
    test("Deve aceitar URLs válidas com https://", () => {
        const url = "https://google.com";
        expect(sanitizeUrl(url)).toBe("https://google.com/");
    });

    test("Deve rejeitar URLs sem https://", () => {
        const url = "http://google.com";
        expect(() => sanitizeUrl(url)).toThrow("URL deve começar com https://");
    });

    test("Deve rejeitar URLs sem protocolo", () => {
        const url = "google.com";
        expect(() => sanitizeUrl(url)).toThrow("URL deve começar com https://");
    });

    test("Deve rejeitar URLs com caminhos relativos (./)", () => {
        const url = "https://example.com/./test";
        expect(() => sanitizeUrl(url)).toThrow("Caminhos relativos (./ ou ../) não são permitidos.");
    });

    test("Deve rejeitar URLs com caminhos relativos (../)", () => {
        const url = "https://example.com/../test";
        expect(() => sanitizeUrl(url)).toThrow("Caminhos relativos (./ ou ../) não são permitidos.");
    });

    test("Deve rejeitar URLs fora do padrão", () => {
        const url = "not-a-url";
        expect(() => sanitizeUrl(url)).toThrow("URL deve começar com https://");
    });

    test("Deve limpar parâmetros UTM", () => {
        const url = "https://example.com/?utm_source=test&foo=bar";
        expect(sanitizeUrl(url)).toBe("https://example.com/?foo=bar");
    });

    test("Deve remover hash/âncora", () => {
        const url = "https://example.com/#section";
        expect(sanitizeUrl(url)).toBe("https://example.com/");
    });
});
