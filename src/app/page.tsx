import styles from "./page.module.css";
import { AnalyzerShell } from "./components/AnalyzerShell/AnalyzerShell";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>SEO Meta Analyser</h1>
        <p className={styles.subtitle}>
          Iniciativa de análise técnica simplificada de metadados.
        </p>
      </header>

      <main className={styles.main}>
        <AnalyzerShell />
      </main>
    </div>
  );
}
