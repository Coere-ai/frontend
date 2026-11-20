import type { Messages } from "../types";

export const launch: Messages["launch"] = {
  connect: { title: "Chrome Web Storeで近日公開", here: "Coere ConnectがChrome Web Storeに登場", line: "Coere Connectで、すべてのAIでひとつの記憶を。興味があればお知らせください。公開日にメールでお知らせします。", hereLine: "すべてのAIでひとつの記憶を。Chrome Web Storeで公開中。", metaTitle: "Coereをインストール", metaDescription: "CoereはまもなくChrome Web Storeに登場します。" },
  teams: { title: "Coere for Teamsはまもなく登場", here: "Coere for Teamsが登場", line: "チーム全体で共有する記憶を、1週間の無料お試し付きで。興味があればお知らせください。公開時にメールでお知らせします。", hereLine: "チーム全体で共有する記憶を、1週間の無料お試し付きで。", metaTitle: "Coere for Teamsを試す", metaDescription: "Coere for Teamsはまもなく登場します。1週間の無料お試し付きです。" },
  opens: "{moment}に公開",
  at: "{date} {time}",
  units: { days: "日", hours: "時間", minutes: "分", seconds: "秒" },
  timer: "残り{days}日{hours}時間{minutes}分{seconds}秒",
  counting: "カウントダウン中",
  interested: "興味がある",
  emailMe: "{name}の公開時にメールで知らせる",
  saving: "保存中",
  countMeIn: "登録する",
  oneEmail: "公開時に一度だけメールします。それ以外は送りません。",
  thanks: "ありがとうございます。登録しました。",
  willEmail: "{name}の公開時に{email}へメールします。",
  addToChrome: "Chromeに追加",
};
