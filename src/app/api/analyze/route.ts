import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type Severity = "info" | "warning" | "error" | "success";

type SeoIssue = {
  id: string;
  level: Severity;
  message: string;
  field?: string;
  recommendation?: string;
};

type BaseMeta = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  lang?: string;
  charset?: string;
};

type OpenGraphMeta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
};

type TwitterMeta = {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
};

export type SeoAnalysisResult = {
  url: string;
  normalizedUrl: string;
  htmlLength: number;
  meta: BaseMeta;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
  issues: SeoIssue[];
};

/**
 * Sanitiza e normaliza a URL para evitar SSRF e remover rastreamento.
 * Força HTTPS, remove parâmetros UTM e valida o formato.
 */
function sanitizeUrl(rawUrl: string): string {
  let urlStr = rawUrl.trim();

  // Adiciona protocolo se estiver faltando
  if (!urlStr.match(/^[a-zA-Z]+:\/\//)) {
    urlStr = "https://" + urlStr;
  }

  try {
    const url = new URL(urlStr);

    // Bloqueia protocolos que não sejam HTTP ou HTTPS (ex: file://, gopher://)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Protocolo não suportado.");
    }

    // Força HTTPS
    url.protocol = "https:";

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

function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    url.hash = "";
    return url.toString();
  } catch {
    return rawUrl.trim();
  }
}

function extractMeta($: cheerio.CheerioAPI): {
  meta: BaseMeta;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
} {
  const title = $("head > title").first().text().trim() || undefined;
  const description =
    $('meta[name="description"]').attr("content")?.trim() || undefined;
  const robots = $('meta[name="robots"]').attr("content")?.trim() || undefined;
  const canonical =
    $('link[rel="canonical"]').attr("href")?.trim() || undefined;
  const lang =
    $("html").attr("lang")?.trim() ||
    $('meta[http-equiv="content-language"]').attr("content")?.trim() ||
    undefined;
  const charset =
    $('meta[charset]').attr("charset") ||
    $('meta[http-equiv="Content-Type"]').attr("content")?.split("charset=")[1] ||
    undefined;

  const og = (property: string) =>
    $(`meta[property="og:${property}"]`).attr("content")?.trim() || undefined;

  const openGraph: OpenGraphMeta = {
    title: og("title"),
    description: og("description"),
    image: og("image"),
    url: og("url"),
    type: og("type"),
    siteName: og("site_name"),
  };

  const tw = (name: string) =>
    $(`meta[name="twitter:${name}"]`).attr("content")?.trim() || undefined;

  const twitter: TwitterMeta = {
    card: tw("card"),
    title: tw("title"),
    description: tw("description"),
    image: tw("image"),
    site: tw("site"),
    creator: tw("creator"),
  };

  return {
    meta: { title, description, robots, canonical, lang, charset },
    openGraph,
    twitter,
  };
}

function evaluateSeo(
  url: string,
  meta: BaseMeta,
  openGraph: OpenGraphMeta,
  twitter: TwitterMeta,
): SeoIssue[] {
  const issues: SeoIssue[] = [];

  const push = (
    id: string,
    level: Severity,
    message: string,
    field?: string,
    recommendation?: string,
  ) => {
    issues.push({ id, level, message, field, recommendation });
  };

  // Title
  if (!meta.title) {
    push(
      "title_missing",
      "error",
      "A tag <title> está ausente.",
      "title",
      "Defina um título único e descritivo para a página (30–60 caracteres).",
    );
  } else {
    const len = meta.title.length;
    if (len < 30) {
      push(
        "title_too_short",
        "warning",
        `O título é muito curto (${len} caracteres).`,
        "title",
        "Use um título entre 30 e 60 caracteres, incluindo palavra‑chave principal.",
      );
    } else if (len > 60) {
      push(
        "title_too_long",
        "warning",
        `O título é muito longo (${len} caracteres).`,
        "title",
        "Tente manter o título entre 50 e 60 caracteres para evitar truncamento nas SERPs.",
      );
    } else {
      push("title_ok", "success", `O título tem um bom tamanho (${len} caracteres).`, "title");
    }
  }

  // Description
  if (!meta.description) {
    push(
      "description_missing",
      "warning",
      "A meta description está ausente.",
      "description",
      "Adicione uma meta description única e persuasiva (70–160 caracteres).",
    );
  } else {
    const len = meta.description.length;
    if (len < 70) {
      push(
        "description_too_short",
        "info",
        `A meta description é curta (${len} caracteres).`,
        "description",
        "Explique melhor o conteúdo, utilizando entre 120 e 160 caracteres.",
      );
    } else if (len > 170) {
      push(
        "description_too_long",
        "warning",
        `A meta description é longa (${len} caracteres).`,
        "description",
        "Reduza para cerca de 160 caracteres para minimizar truncamento.",
      );
    } else {
      push("description_ok", "success", `A meta description tem um bom tamanho (${len} caracteres).`, "description");
    }
  }

  // Canonical
  if (!meta.canonical) {
    push(
      "canonical_missing",
      "info",
      "Tag canonical ausente.",
      "canonical",
      "Considere adicionar uma tag canonical apontando para a URL preferencial para evitar conteúdo duplicado.",
    );
  } else {
    try {
      const normalized = normalizeUrl(url);
      const canonicalNormalized = normalizeUrl(meta.canonical);
      let canonicalError = false;
      if (canonicalNormalized && !canonicalNormalized.startsWith("http")) {
        push(
          "canonical_relative",
          "warning",
          "A tag canonical é relativa.",
          "canonical",
          "Prefira sempre URLs absolutas na tag canonical (incluindo protocolo e domínio).",
        );
        canonicalError = true;
      }
      if (
        canonicalNormalized &&
        normalized !== canonicalNormalized &&
        !canonicalNormalized.endsWith("/")
      ) {
        push(
          "canonical_differs",
          "info",
          "A URL canonical difere da URL analisada.",
          "canonical",
          "Verifique se a canonical realmente deve apontar para outra URL (por exemplo, versão sem parâmetros).",
        );
      }
      if (!canonicalError) {
        push("canonical_ok", "success", "Tag canonical configurada corretamente.", "canonical");
      }
    } catch {
      push(
        "canonical_invalid",
        "warning",
        "A URL da tag canonical parece inválida.",
        "canonical",
        "Verifique se a canonical é uma URL válida e completa.",
      );
    }
  }

  // Robots
  if (meta.robots) {
    const robotsValue = meta.robots.toLowerCase();
    let robotsWarning = false;
    if (robotsValue.includes("noindex")) {
      push(
        "robots_noindex",
        "warning",
        'A página está marcada com "noindex".',
        "robots",
        "Confirme se a intenção é realmente impedir a indexação desta página.",
      );
      robotsWarning = true;
    }
    if (robotsValue.includes("nofollow")) {
      push(
        "robots_nofollow",
        "info",
        'A página está marcada com "nofollow".',
        "robots",
        "Confirme se deseja realmente que os links desta página não sejam seguidos.",
      );
    }
    if (!robotsWarning) {
      push("robots_ok", "success", `Meta robots configurada: ${meta.robots}`, "robots");
    }
  } else {
    push("robots_none", "success", "Sem meta robots (padrão: index, follow).", "robots");
  }

  // Language
  if (!meta.lang) {
    push(
      "lang_missing",
      "info",
      "A tag de idioma (atributo lang em <html>) não foi encontrada.",
      "lang",
      "Defina o atributo lang em <html>, por exemplo lang=\"pt-BR\".",
    );
  } else {
    push("lang_ok", "success", `Atributo lang presente: ${meta.lang}`, "lang");
  }

  // Charset
  if (!meta.charset) {
    push(
      "charset_missing",
      "info",
      "Meta charset não encontrada.",
      "charset",
      "Defina <meta charset=\"utf-8\"> para garantir codificação consistente.",
    );
  } else {
    push("charset_ok", "success", `Meta charset definida: ${meta.charset}`, "charset");
  }

  // Open Graph (Facebook, Discord, Mastodon)
  if (!openGraph.title || !openGraph.description || !openGraph.image) {
    push(
      "og_incomplete",
      "warning",
      "Tags Open Graph importantes estão incompletas.",
      "open_graph",
      "Inclua pelo menos og:title, og:description e og:image para uma boa pré-visualização em Facebook, Discord e Mastodon.",
    );
  } else {
    push("og_ok", "success", "Principais tags Open Graph configuradas.", "open_graph");
  }

  // Twitter Card (X)
  if (!twitter.card) {
    push(
      "twitter_card_missing",
      "info",
      "Meta twitter:card ausente.",
      "twitter",
      'Adicione <meta name="twitter:card" content="summary_large_image"> para uma boa prévia no X (Twitter).',
    );
  } else {
    push("twitter_ok", "success", `Meta twitter:card presente: ${twitter.card}`, "twitter");
  }

  return issues;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

    if (!rawUrl) {
      return NextResponse.json(
        { error: "URL é obrigatória." },
        { status: 400 },
      );
    }

    let normalizedTargetUrl: string;
    try {
      normalizedTargetUrl = sanitizeUrl(rawUrl);
    } catch (err) {
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "URL inválida. Use um formato como seusite.com ou https://seusite.com",
        },
        { status: 400 },
      );
    }

    const targetUrl = new URL(normalizedTargetUrl);

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "SEO-Analyser-Bot/1.0 (+https://example.com; educational-purpose)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Falha ao buscar a página (${response.status} ${response.statusText}).`,
        },
        { status: 502 },
      );
    }

    const html = await response.text();
    const htmlLength = html.length;

    const $ = cheerio.load(html);
    const { meta, openGraph, twitter } = extractMeta($);

    const normalizedUrl = normalizeUrl(response.url || targetUrl.toString());
    const issues = evaluateSeo(normalizedUrl, meta, openGraph, twitter);

    const result: SeoAnalysisResult = {
      url: targetUrl.toString(),
      normalizedUrl,
      htmlLength,
      meta,
      openGraph,
      twitter,
      issues,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("SEO analyze error:", error);
    return NextResponse.json(
      { error: "Erro interno ao analisar a página." },
      { status: 500 },
    );
  }
}

