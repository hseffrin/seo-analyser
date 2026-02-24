import { useState } from "react";
import styles from "./PreviewSocial.module.css";
import type { OpenGraphMeta, TwitterMeta } from "./types";

type TabId = "facebook" | "x" | "mastodon" | "discord";

type PreviewSocialProps = {
  url: string;
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
  openGraph,
  twitter,
}: PreviewSocialProps) {
  const [activeTab, setActiveTab] = useState<TabId>("facebook");

  const sharedTitle =
    openGraph.title ??
    twitter.title ??
    "Título para redes sociais (og:title / twitter:title)";

  const sharedDescription =
    openGraph.description ??
    twitter.description ??
    "Descrição que será usada para prévias em Facebook, X, Mastodon e Discord.";

  const sharedImage =
    openGraph.image ?? twitter.image ?? "https://via.placeholder.com/1200x630";

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
            className={`${styles.tab} ${
              activeTab === tab ? styles.tabActive : ""
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
            style={{ backgroundImage: `url(${sharedImage})` }}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.host}>{displayHost}</div>
          <div className={styles.title}>{sharedTitle}</div>
          <div className={styles.description}>{sharedDescription}</div>
        </div>
      </div>

      <p className={styles.helper}>
        Facebook, Mastodon e Discord baseiam-se principalmente nas tags Open
        Graph (og:*). X (Twitter) usa twitter:* mas também costuma herdar valores
        das tags Open Graph.
      </p>
    </div>
  );
}

