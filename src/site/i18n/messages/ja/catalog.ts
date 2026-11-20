import type { Messages } from "../types";

export const catalog: Messages["catalog"] = {
  products: {
    connect: {
      kind: "個人のための記憶",
      tagline: "あなたの記憶を、すべてのAIで。",
      description: "あなたのものになる記憶レイヤー。使っているすべてのAIのチャットを保存し、新しいチャットのたびにふさわしいコンテキストを届けます。",
    },
    solutions: {
      kind: "チームのための記憶",
      tagline: "会社全体で、ひとつの記憶を。",
      description: "会社と社員、そして顧客のための共有の記憶。どのチャットも、チームがすでに知っていることから始まります。",
    },
    forge: {
      kind: "開発者のための記憶",
      tagline: "アプリのための記憶インフラ。",
      description: "API、MCPサーバー、SDKで、アプリやエージェントがCoereを記憶レイヤーとして使えます。いつも本人の許可のもとで。",
    },
    agents: {
      kind: "あらゆる分野のエージェント",
      tagline: "ひとりの働き手に、無限の可能性。あなたの記憶の上に。",
      description: "Coereのアシスタント、Coriの分野別バージョン。どれもあなたの記憶をもとに動き、大きなタスクは複数のワーカーに分けて進めます。",
    },
  },
  features: {
    memory: {
      name: "記憶",
      title: "チャットから学んだすべてを、ひとつのグラフに",
      description: "Coereはチャットの内容をセクションとフォルダに整理し、あなたを中心に描きます。どの記憶も、元になったメッセージとつながっています。",
    },
    extraction: {
      name: "抽出",
      title: "これまでのチャットを、すべて一か所に",
      description: "Extract allでChatGPT、Claude、Geminiを読み込み、すべてのチャットをパソコンに保存します。その後は、新しいチャットが自動で加わります。",
    },
    "smart-context": {
      name: "スマートコンテキスト",
      title: "入力しながら、ふさわしいコンテキストを",
      description: "チャット欄の上の一行に、Coereが何を加えるのか、どのAIから学んだのかが表示されます。Enterを一度押せば、コンテキスト付きでメッセージが送られます。",
    },
    voice: {
      name: "音声",
      title: "声で聞いて、声で答えを",
      description: "右Optionキーを押しながら話します。Coriは話した言葉をその場で表示し、キーを離すと声で答えます。",
    },
    cori: {
      name: "Cori",
      title: "すべてのAIに、ひとりのアシスタント",
      description: "Coriは普段の言葉で過去のチャットを探し、Coereの使い方にも答えます。ダッシュボードでも、ツールバーでも、どのAIサイトでも。",
    },
    actions: {
      name: "アクション",
      title: "あなたらしい文体でメールを",
      description: "Coriにメールを頼むと、記憶にある情報を使って専用のGmailタブで書き上げます。あなたが名前を挙げていない相手に送る前には、必ず確認します。",
    },
    writer: {
      name: "ライター",
      title: "文章を、その場で整える",
      description: "Gmail、Docs、チャット欄で文章を選択します。Coriが直したり磨いたりして、残すか戻すかを決めるまで変更箇所を青で示します。",
    },
    "any-site": {
      name: "どのサイトでも",
      title: "フォームやクイズを、知っていることから",
      description: "どのページでも、Coriは記憶をもとに一歩ずつ進め、送信の前に確認し、ページが指示を出そうとしたら止まります。",
    },
    workers: {
      name: "ワーカー",
      title: "調べものを、たくさんのタブで分担",
      description: "大きなタスクを複数のタブで同時に進めます。見つかった情報はひとつの表にまとまり、どの値にも出どころのページが付きます。",
    },
  },
  seeAllFeatures: "すべての機能を見る",
  applications: {
    consumer: { name: "個人", summary: "すべてのAIで、ひとつの記憶。" },
    developer: { name: "開発者", summary: "記憶を読むアプリとエージェント。" },
    business: { name: "企業", summary: "会社と顧客の記憶。" },
  },
  industries: {
    finance: { name: "金融", summary: "どのアドバイザーも、すべての履歴から始められます。", uses: ["顧客の記憶", "会議のフォローアップ"], alt: "ウォール街のニューヨーク証券取引所" },
    technology: { name: "テクノロジー", summary: "エンジニアリングの文脈を、ツールからツールへ。", uses: ["プロジェクトの記憶", "エージェントのコンテキスト"], alt: "セールスフォース・タワーが見えるサンフランシスコの夜景" },
    commerce: { name: "商社・貿易", summary: "あらゆる市場での取引と約束を。", uses: ["取引先の記憶", "パートナーとの履歴"], alt: "ビクトリア・ハーバー越しに見る香港の街並み" },
    consumer: { name: "消費財・小売", summary: "どのチャネルでも、お客様を理解。", uses: ["顧客の記憶", "サポートのコンテキスト"], alt: "商品が並ぶスーパーマーケットの通路" },
    manufacturing: { name: "製造", summary: "ラインで得た知見は、工場に残ります。", uses: ["ラインと機械のメモ", "引き継ぎの記憶"], alt: "工場の組立ラインで動くロボットアーム" },
    energy: { name: "エネルギー", summary: "現場の知識を、会社に残します。", uses: ["拠点と設備のメモ", "引き継ぎの記憶"], alt: "霧の上に広がるリバモアの丘の風力発電機" },
    education: { name: "教育", summary: "前回の続きから始まる授業。", uses: ["授業の記憶", "学習のコンテキスト"], alt: "UCバークレーのセイザータワー" },
    legal: { name: "法務", summary: "事務所全体で、案件と先例を。", uses: ["案件の記憶", "顧客の履歴"], alt: "アメリカ合衆国最高裁判所" },
  },
  guides: {
    "portable-ai-memory": { name: "持ち運べるAIの記憶", kind: "基本を知る" },
    "chatgpt-to-claude-memory": { name: "ChatGPTからClaudeへ", kind: "AIの乗り換え" },
    "ai-agent-memory": { name: "AIエージェントの記憶", kind: "開発者向け" },
  },
};
