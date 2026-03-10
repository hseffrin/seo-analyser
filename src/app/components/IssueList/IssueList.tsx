import styles from "./IssueList.module.css";
import type { SeoIssue } from "../types";

type IssueListProps = {
  issues: SeoIssue[];
};

const Icons = {
  error: (
    <svg className={`${styles.icon} ${styles.error}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" />
    </svg>
  ),
  warning: (
    <svg className={`${styles.icon} ${styles.warning}`} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  success: (
    <svg className={`${styles.icon} ${styles.success}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
  info: (
    <svg className={`${styles.icon} ${styles.info}`} viewBox="0 0 24 24" fill="currentColor">
       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
};

export function IssueList({ issues }: IssueListProps) {
  if (!issues.length) {
    return (
      <div className={styles.empty}>
        <p>Nenhum problema relevante foi encontrado nas meta tags analisadas.</p>
        <p className={styles.emptyHint}>
          Ainda assim, valide o conteúdo da página e demais fatores de SEO.
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

  const renderSection = (level: keyof typeof Icons, title: string) => {
    const list = grouped[level];
    if (list.length === 0) return null;

    return (
      <div className={styles.severitySection}>
        <h3 className={styles.severityTitle}>
          {list.length > 0 && Icons[level]}
          <span>{title} ({list.length})</span>
        </h3>
        <ul className={styles.list}>
          {list.map((issue) => (
            <li key={issue.id} className={styles.item}>
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
      {renderSection("success", "Auditorias Passadas")}
      {renderSection("info", "Informações Adicionais")}
      {renderSection("warning", "Diagnósticos e Melhorias")}
      {renderSection("error", "Oportunidades Críticas")}
    </div>
  );
}

