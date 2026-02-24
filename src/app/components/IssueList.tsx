import styles from "./IssueList.module.css";
import type { SeoIssue } from "./types";

type IssueListProps = {
  issues: SeoIssue[];
};

const LEVEL_LABEL: Record<SeoIssue["level"], string> = {
  error: "Erro",
  warning: "Aviso",
  info: "Info",
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Checklist de SEO on-page</h2>
      <ul className={styles.list}>
        {issues.map((issue) => (
          <li key={issue.id} className={styles.item}>
            <span className={`${styles.badge} ${styles[issue.level]}`}>
              {LEVEL_LABEL[issue.level]}
            </span>
            <div className={styles.content}>
              <p className={styles.message}>{issue.message}</p>
              {issue.recommendation && (
                <p className={styles.recommendation}>
                  <span>Sugestão:</span> {issue.recommendation}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

