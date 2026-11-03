/**
 * One plotted bucket.
 *
 * Lifted out of the source dashboard's UsageLineChart, which this port does not
 * include: `chartSeries` builds these and `MultiLineChart` draws them, so the
 * shape belongs to neither.
 */
export interface LinePoint {
  /** Full name of the bucket, shown in the hover tooltip. */
  label: string;
  value: number;
  /** Axis-tick text when this bucket starts a new division of the axis,
   *  midnight on an hourly view, the 1st of a month on a daily one. Buckets
   *  without one still plot and still hover; they just carry no label. */
  tick?: string;
}
