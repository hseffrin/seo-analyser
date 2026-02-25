import { useState } from "react";
import styles from "./PreviewSocial.module.css";
import type { BaseMeta, OpenGraphMeta, TwitterMeta } from "../types";

type TabId = "facebook" | "x" | "mastodon" | "discord";

type PreviewSocialProps = {
  url: string;
  meta: BaseMeta;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
};

const TAB_LABELS: Record<TabId, string> = {
  facebook: "Facebook",
  x: "X (Twitter)",
  mastodon: "Mastodon",
  discord: "Discord",
};

export function PreviewSocial({
  url,
  meta,
  openGraph,
  twitter,
}: PreviewSocialProps) {
  const [activeTab, setActiveTab] = useState<TabId>("facebook");

  // Logic to calculate dynamic content based on platform
  const { title, description, image } = (() => {
    const isTwitter = activeTab === "x";

    if (isTwitter) {
      return {
        title:
          twitter.title ??
          openGraph.title ??
          meta.title ??
          "Título para X/Twitter",
        description:
          twitter.description ??
          openGraph.description ??
          meta.description ??
          "Descrição para X/Twitter",
        image: twitter.image ?? openGraph.image ?? "https://via.placeholder.com/1200x630",
      };
    }

    // Default for Facebook, Mastodon, Discord (priority to OpenGraph)
    return {
      title: openGraph.title ?? meta.title ?? `Título para ${TAB_LABELS[activeTab]}`,
      description:
        openGraph.description ??
        meta.description ??
        `Descrição para ${TAB_LABELS[activeTab]}`,
      image: openGraph.image ?? twitter.image ?? "https://via.placeholder.com/1200x630",
    };
  })();

  const displayHost = (() => {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  })();

  return (
    <div className={styles.container}>
      <h3 className={styles.label}>Prévia aproximada em redes sociais</h3>

      <div className={styles.tabs}>
        {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <div
            className={styles.image}
            style={{ backgroundImage: `url(${image})` }}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.host}>{displayHost}</div>
          <div className={styles.title}>{title}</div>
          <div className={styles.description}>{description}</div>
        </div>
      </div>

      <p className={styles.helper}>
        {activeTab === "x" ? (
          <>
            X (Twitter) usa prioritariamente tags <code>twitter:*</code>, mas
            frequentemente herda de <code>og:*</code> se aquelas estiverem
            ausentes.
          </>
        ) : (
          <>
            {TAB_LABELS[activeTab]} baseia-se principalmente nas tags Open Graph (
            <code>og:*</code>).
          </>
        )}
      </p>
    </div>
  );
}

