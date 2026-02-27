export type Severity = "info" | "warning" | "error" | "success";

export type SeoIssue = {
  id: string;
  level: Severity;
  message: string;
  field?: string;
  recommendation?: string;
};

export type BaseMeta = {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  lang?: string;
  charset?: string;
};

export type OpenGraphMeta = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
};

export type TwitterMeta = {
  card?: string;
  title?: string;
  description?: string;
  image?: string;
  site?: string;
  creator?: string;
};

export type SeoAnalysisResult = {
  url: string;
  normalizedUrl: string;
  htmlLength: number;
  meta: BaseMeta;
  openGraph: OpenGraphMeta;
  twitter: TwitterMeta;
  issues: SeoIssue[];
};

