'use client';

import { useState } from "react";
import styles from "./UrlForm.module.css";
import type { SeoAnalysisResult } from "../types";

type UrlFormProps = {
  onResult: (result: SeoAnalysisResult) => void;
};

export function UrlForm({ onResult }: UrlFormProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lowerValue = value.toLowerCase();
    const protocol = "https://";

    // Se o input estiver vazio ou o usuário estiver digitando o protocolo manualmente (começando com 'h'...), não prefixar
    if (!value || protocol.startsWith(lowerValue)) {
      setUrl(value);
      return;
    }

    // Se não começar com http, adiciona o prefixo
    if (!lowerValue.startsWith("http")) {
      setUrl(protocol + value);
    } else {
      setUrl(value);
    }
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Informe uma URL para analisar.");
      return;
    }

    // Normalização básica no cliente
    let normalizedUrl = trimmed;
    if (!normalizedUrl.match(/^[a-zA-Z]+:\/\//)) {
      normalizedUrl = "https://" + normalizedUrl;
    } else if (normalizedUrl.startsWith("http://")) {
      normalizedUrl = normalizedUrl.replace("http://", "https://");
    }

    try {
      const urlObj = new URL(normalizedUrl);
      urlObj.hash = "";

      // Remove UTM
      const params = new URLSearchParams(urlObj.search);
      const keysToRemove: string[] = [];
      params.forEach((_, key) => {
        if (key.toLowerCase().startsWith("utm_")) {
          keysToRemove.push(key);
        }
      });
      keysToRemove.forEach(key => params.delete(key));
      urlObj.search = params.toString();

      normalizedUrl = urlObj.toString();
      setUrl(normalizedUrl); // Atualiza o campo para o usuário ver a mudança
    } catch {
      setError("URL inválida.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Falha ao analisar a página.");
        return;
      }

      onResult(data as SeoAnalysisResult);
    } catch {
      setError("Erro de rede ao chamar o analisador.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGroup}>
        <label htmlFor="url" className={styles.label}>
          URL do site
        </label>
        <div className={styles.inputRow}>
          <input
            id="url"
            type="url"
            placeholder="https://www.seusite.com"
            value={url}
            onChange={handleChange}
            className={styles.input}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Analisando..." : "Analisar"}
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.helper}>
          O analisador vai baixar o HTML da página e avaliar automaticamente as
          principais meta tags de SEO.
        </p>
      </div>
    </form>
  );
}

