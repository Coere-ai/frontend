import type { Messages } from "../types";

export const pricing: Messages["pricing"] = {
  title: "あなたにも、チームにも、アプリにも合うプラン",
  line: "1人なら無料。チームと開発者の方はご相談ください。",
  plansLabel: "プラン",
  plans: {
    consumer: {
      name: "個人",
      kind: "あなたのために",
      price: "無料",
      priceNote: "Coere Connect、1人向け",
      line: "あなたが持つひとつの記憶を、使うすべてのAIで。",
      features: ["AI間の転送が無制限", "チャットの抽出が無制限", "ChatGPT、Claude、Geminiなどでひとつの記憶", "ローカル優先、coere.aiにバックアップ"],
      cta: "無料で始める",
    },
    team: {
      name: "チーム",
      kind: "企業向け",
      price: "お問い合わせ",
      priceNote: "Coere Solutions、チーム全体で",
      line: "会社と社員、顧客のための、ひとつの共有の記憶。",
      features: ["エンタープライズ級のセキュリティ", "シングルサインオン（SSO）", "監査ログ", "チームで共有する記憶", "招待、権限、アクセスの管理機能"],
      cta: "デモを予約",
    },
    developer: {
      name: "開発者",
      kind: "アプリのために",
      price: "ユーザー単位",
      priceNote: "Coere Forge、従量制",
      line: "アプリのユーザーに、すでに育てた記憶を。",
      features: ["記憶API", "エージェント向けMCPサーバー", "TypeScriptとPythonのSDK", "本人が取り消せる範囲限定のトークン", "従量制、ユーザー単位"],
      cta: "ウェイトリストに登録",
    },
  },
  closing: { title: "どのプランが合うか迷ったら", text: "あなた、チーム、アプリのためのCoereについて、創業者にご相談ください。" },
};
