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

    // SVG Gauge calculations (aligned with PSI 120x120 container)
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getScoreClass = () => {
        if (score < 50) return styles.low;
        if (score < 90) return styles.mid;
        return styles.high;
    };

    const getScoreMessage = () => {
        if (score < 50) return "Desempenho de SEO baixo";
        if (score < 90) return "O desempenho de SEO precisa de melhorias";
        return "Ótimo desempenho de SEO";
    };

    const renderMiniGauge = (count: number, total: number, level: "success" | "warning" | "error") => {
        const miniRadius = 18;
        const miniCircumference = 2 * Math.PI * miniRadius;
        // If total is 0, show empty gauge. Otherwise show proportion.
        // Actually, for these "legend" gauges, Google often shows them as full or based on a specific logic.
        // The user asked for "the same circle graph for errors, warnings and passed".
        // I will make them represent the percentage of the total checks.
        const percentage = total > 0 ? (count / total) * 100 : 0;
        const miniOffset = miniCircumference - (percentage / 100) * miniCircumference;

        return (
            <svg width="44" height="44" className={styles.miniChart}>
                <circle
                    className={styles.miniTrack}
                    cx="22"
                    cy="22"
                    r={miniRadius}
                />
                <circle
                    className={`${styles.miniFill} ${styles[level]}`}
                    cx="22"
                    cy="22"
                    r={miniRadius}
                    strokeDasharray={miniCircumference}
                    strokeDashoffset={miniOffset}
                    strokeLinecap="round"
                />
            </svg>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.chartContainer}>
                <svg className={styles.chart} width="120" height="120">
                    <circle
                        className={styles.track}
                        cx="60"
                        cy="60"
                        r={radius}
                    />
                    <circle
                        className={`${styles.fill} ${getScoreClass()}`}
                        cx="60"
                        cy="60"
                        r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <div className={styles.scoreText}>
                    <span className={`${styles.scoreValue} ${getScoreClass()}`}>{score}</span>
                </div>
            </div>

            <div className={styles.stats}>
                <div className={styles.statItem}>
                    {renderMiniGauge(counts.error, totalChecks, "error")}
                    <span className={styles.statValue}>{counts.error}</span>
                    <span className={styles.statLabel}>Erros</span>
                </div>
                <div className={styles.statItem}>
                    {renderMiniGauge(counts.warning, totalChecks, "warning")}
                    <span className={styles.statValue}>{counts.warning}</span>
                    <span className={styles.statLabel}>Avisos</span>
                </div>
                <div className={styles.statItem}>
                    {renderMiniGauge(counts.success, totalChecks, "success")}
                    <span className={styles.statValue}>{counts.success}</span>
                    <span className={styles.statLabel}>Passaram</span>
                </div>
            </div>
            
            <p className={styles.message}>
                {getScoreMessage()}
            </p>
        </div>
    );
}
