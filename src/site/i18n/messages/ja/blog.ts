import type { Messages } from "../types";

export const blog: Messages["blog"] = {
  title: "Coereブログ",
  line: "あなたのものになる記憶レイヤーをつくるチームから、ニュース、リリース、メモをお届けします。",
  readNewest: "最新の記事を読む",
  more: "その他の記事",
  filterLabel: "カテゴリで記事を絞り込む",
  all: "すべて",
  categories: { Company: "会社", Product: "製品", Developers: "開発者" },
  count: { one: "{count}件の記事", other: "{count}件の記事" },
  countIn: { one: "{category}の記事{count}件", other: "{category}の記事{count}件" },
  minutes: "{minutes}分で読めます",
  posts: {
    "introducing-coere-connect": {
      title: "Coere Connectの紹介：すべてのAIで、ひとつの記憶",
      excerpt: "すべてのAIとのチャットを一か所に保存し、新しいチャットのたびに届けます。",
    },
    "coere-solutions": {
      title: "Coere Solutions：チーム全体で、ひとつの記憶",
      excerpt: "会社の知識とすべての顧客を、チーム全体で記憶します。",
    },
    "coere-forge": {
      title: "Forge：初日からアプリに記憶を",
      excerpt: "Coereの上につくるためのAPI、MCPサーバー、SDK。",
    },
    "catalyst-26": {
      title: "Catalyst 26：今年つくるもの",
      excerpt: "Coereがめざす場所と、記憶が人のものであるべき理由。",
    },
  },
};
