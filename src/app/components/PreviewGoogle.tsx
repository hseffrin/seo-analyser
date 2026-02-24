import styles from "./PreviewGoogle.module.css";
import type { BaseMeta } from "./types";

type PreviewGoogleProps = {
  url: string;
  meta: BaseMeta;
};

export function PreviewGoogle({ url, meta }: PreviewGoogleProps) {
  const title = meta.title ?? "Título da página";
  const description =
    meta.description ??
    "Esta é uma pré-visualização aproximada de como sua página pode aparecer nos resultados do Google.";

  const displayUrl = (() => {
    try {
      const parsed = new URL(url);
      return parsed.host + parsed.pathname.replace(/\/$/, "");
    } catch {
      return url;
    }
  })();

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Prévia aproximada no Google</h3>
      <div className={styles.card}>
        <div className={styles.url}>{displayUrl}</div>
        <div className={styles.title}>{title}</div>
        <div className={styles.description}>{description}</div>
      </div>
    </div>
  );
}

