import styles from "./page.module.css";
import { AnalyzerShell } from "./components/AnalyzerShell";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>SEO Meta Analyser</h1>
            <p className={styles.subtitle}>
              Analise rapidamente as principais meta tags de qualquer página,
              veja um checklist prático e visualize como o link deve aparecer no
              Google e nas redes sociais.
            </p>
          </div>
        </header>

        <AnalyzerShell />
      </main>
    </div>
  );
}
