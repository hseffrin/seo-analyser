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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Informe uma URL para analisar.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: trimmed }),
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
            onChange={(e) => setUrl(e.target.value)}
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

