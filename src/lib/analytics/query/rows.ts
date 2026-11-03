// The rows the read layer pulls from Supabase, column for column.

export type VisitRow = {
  session_id: string;
  visitor_id: string;
  path: string;
  referrer: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  duration_seconds: number;
  max_scroll: number;
  converted: boolean;
  cta_clicks: number;
  created_at: string;
};

export type SectionRow = {
  session_id: string;
  visitor_id: string;
  path: string;
  section: string;
  seconds: number;
  /** Null on rows written before labels existed. */
  label: string | null;
  position: number | null;
  created_at: string;
};

export type EventRow = {
  path: string;
  kind: string;
  label: string | null;
  href: string | null;
  created_at: string;
};

export const VISIT_COLUMNS =
  "session_id,visitor_id,path,referrer,device,browser,os,country,region,city," +
  "latitude,longitude,duration_seconds,max_scroll,converted,cta_clicks,created_at";

export const SECTION_COLUMNS =
  "session_id,visitor_id,path,section,seconds,label,position,created_at";

/** The same rows without the two newer columns, for a database that has not
 *  had the section-labels migration applied yet. */
export const LEGACY_SECTION_COLUMNS =
  "session_id,visitor_id,path,section,seconds,created_at";

export const EVENT_COLUMNS = "path,kind,label,href,created_at";
