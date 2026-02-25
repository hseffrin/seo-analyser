'use client';

import { useState } from "react";
import styles from "./AnalyzerShell.module.css";
import { UrlForm } from "../UrlForm/UrlForm";
import { IssueList } from "../IssueList/IssueList";
import { PreviewGoogle } from "../PreviewGoogle/PreviewGoogle";
import { PreviewSocial } from "../PreviewSocial/PreviewSocial";
import type { SeoAnalysisResult } from "../types";

export function AnalyzerShell() {
  const [analysis, setAnalysis] = useState<SeoAnalysisResult | null>(null);

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <UrlForm onResult={setAnalysis} />
      </section>

      <section className={styles.sectionGrid}>
        <div className={styles.column}>
          <IssueList issues={analysis?.issues ?? []} />
        </div>
        <div className={styles.column}>
          <div className={styles.previews}>
            <PreviewGoogle
              url={analysis?.normalizedUrl ?? "https://www.seusite.com"}
              meta={analysis?.meta ?? {}}
            />
            <PreviewSocial
              url={analysis?.normalizedUrl ?? "https://www.seusite.com"}
              meta={analysis?.meta ?? {}}
              openGraph={analysis?.openGraph ?? {}}
              twitter={analysis?.twitter ?? {}}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

