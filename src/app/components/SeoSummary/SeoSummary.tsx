import styles from "./SeoSummary.module.css";
import type { SeoIssue } from "../types";

type SeoSummaryProps = {
    issues: SeoIssue[];
};

export function SeoSummary({ issues }: SeoSummaryProps) {
    const counts = {
        error: issues.filter((i) => i.level === "error").length,
        warning: issues.filter((i) => i.level === "warning").length,
        success: issues.filter((i) => i.level === "success").length,
        info: issues.filter((i) => i.level === "info").length,
    };

    const totalWeighted = counts.success * 1 + counts.warning * 0.5 + counts.error * 0;
    const totalChecks = counts.success + counts.warning + counts.error;

    const score = totalChecks > 0 ? Math.round((totalWeighted / totalChecks) * 100) : 0;

    // SVG Gauge calculations
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getScoreClass = () => {
        if (score < 50) return styles.low;
        if (score < 85) return styles.mid;
        return styles.high;
    };

    const getScoreMessage = () => {
        if (score < 50) return "SEO crítico. Precisa de atenção imediata.";
        if (score < 85) return "Bom trabalho, mas há espaço para melhorias.";
        if (score === 100) return "Excelente! Seu SEO on-page está perfeito.";
        return "Ótimo desempenho de SEO!";
    };

    return (
        <div className={styles.container}>
            <div className={styles.chartContainer}>
                <svg className={styles.chart} width="160" height="160">
                    <circle
                        className={styles.track}
                        cx="80"
                        cy="80"
                        r={radius}
                    />
                    <circle
                        className={`${styles.fill} ${getScoreClass()}`}
                        cx="80"
                        cy="80"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className={styles.scoreText}>
                    <span className={styles.scoreValue}>{score}</span>
                    <span className={styles.scoreLabel}>pontos</span>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.error}`} />
                    <span>Erros Críticos</span>
                    <span className={styles.statValue}>{counts.error}</span>
                </div>
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.warning}`} />
                    <span>Melhorias</span>
                    <span className={styles.statValue}>{counts.warning}</span>
                </div>
                <div className={styles.statItem}>
                    <div className={`${styles.statDot} ${styles.success}`} />
                    <span>Corretos</span>
                    <span className={styles.statValue}>{counts.success}</span>
                </div>
                <p className={`${styles.message} ${getScoreClass()}`}>
                    {getScoreMessage()}
                </p>
            </div>
        </div>
    );
}
