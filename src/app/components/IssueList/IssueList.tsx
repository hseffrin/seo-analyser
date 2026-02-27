import styles from "./IssueList.module.css";
import type { SeoIssue } from "../types";

type IssueListProps = {
  issues: SeoIssue[];
};

const LEVEL_LABEL: Record<SeoIssue["level"], string> = {
  error: "Erro",
  warning: "Aviso",
  info: "Info",
  success: "Sucesso",
};

export function IssueList({ issues }: IssueListProps) {
  if (!issues.length) {
    return (
      <div className={styles.empty}>
        <p>Nenhum problema relevante foi encontrado nas meta tags analisadas.</p>
        <p className={styles.emptyHint}>
          Ainda assim, valide o conteúdo da página e demais fatores de SEO
          (conteúdo, performance, links internos, etc.).
        </p>
      </div>
    );
  }

  const grouped = {
    error: issues.filter((i) => i.level === "error"),
    warning: issues.filter((i) => i.level === "warning"),
    info: issues.filter((i) => i.level === "info"),
    success: issues.filter((i) => i.level === "success"),
  };

  const renderSection = (level: keyof typeof grouped, title: string) => {
    const list = grouped[level];
    if (list.length === 0) return null;

    return (
      <div className={styles.severitySection}>
        <h3 className={`${styles.severityTitle} ${styles[level]}`}>
          {title} ({list.length})
        </h3>
        <ul className={styles.list}>
          {list.map((issue) => (
            <li key={issue.id} className={`${styles.item} ${styles[issue.level]}`}>
              <span className={`${styles.badge} ${styles[issue.level]}`}>
                {LEVEL_LABEL[issue.level]}
              </span>
              <div className={styles.content}>
                <p className={styles.message}>{issue.message}</p>
                {issue.recommendation && (
                  <p className={styles.recommendation}>
                    <span>Sugerido:</span> {issue.recommendation}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Resultados da Análise</h2>
      {renderSection("error", "Erros Críticos")}
      {renderSection("warning", "Avisos e Melhorias")}
      {renderSection("info", "Informações")}
      {renderSection("success", "Itens de Sucesso")}
    </div>
  );
}

