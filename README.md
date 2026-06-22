# 🎌 ANIME TIER MAKER

> アニメ特化型のTier表作成Webアプリ。「ただ画像を並べる」を超えた、生きたデータベースと連携したランキング体験。

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=flat&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)

---

## 概要

**ANIME TIER MAKER** は、アニメファンのために設計されたTier表作成ツールです。

既存の [TierMaker](https://tiermaker.com/) などのサービスは「画像をアップロードして並べるだけ」ですが、本アプリは **Jikan API（非公式MyAnimeList API）** とリアルタイム連携することで、常に最新のアニメデータベースから作品を検索・追加できます。

| 従来のTierMaker | ANIME TIER MAKER |
|---|---|
| 画像のみで作品名が不明 | タイトル・詳細情報を常に表示 |
| 事前にテンプレート準備が必要 | 作品名・シーズン・ジャンルで即検索 |
| 新作追加のたびに更新が必要 | 常に最新アニメDBから追加可能 |
| 静的な画像管理 | ホバーで制作会社・放送年・ジャンル表示 |

---

## 主な機能

- **インテリジェント検索** — 作品名（日本語/英語）・放送シーズン・ジャンルで絞り込み
- **ドラッグ＆ドロップ** — `@dnd-kit` によるスムーズなTier行への移動（タッチデバイス対応）
- **Tierカスタマイズ** — 行の追加・削除・ラベル編集・カラー変更
- **画像エクスポート** — `html-to-image` で高品質な画像として保存
- **認証 & クラウド保存** — Supabaseによるユーザー認証とTier構成の保存・共有

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| State Management | Zustand |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| API | Jikan API v4 |
| Backend / Auth | Supabase |
| Image Export | html-to-image |

---

## ローカル起動

```bash
git clone https://github.com/Aryu-Tamura/anime_tier_maker.git
cd anime_tier_maker
npm install
```

`.env.local` を作成して Supabase の環境変数を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

---

## アーキテクチャ

```
src/
├── app/
│   ├── page.tsx              # メイン画面（Tier Canvas + Search Sidebar）
│   ├── login/page.tsx        # ログイン画面
│   └── api/proxy-image/      # CORSを回避する画像プロキシ
├── components/
│   ├── tier-list-canvas.tsx  # Tier表本体
│   ├── anime-search-sidebar.tsx # 検索パネル
│   ├── droppable-tier-row.tsx   # ドロップ対応Tier行
│   └── sortable-anime-card.tsx  # ドラッグ可能なアニメカード
├── store/
│   └── anime-store.ts        # Zustandによるグローバル状態管理
└── lib/
    └── supabase/             # Supabaseクライアント設定
```

---

## 今後の実装予定

- [ ] シーズン別一括インポート（「2024年冬アニメをすべて追加」）
- [ ] テキストリスト出力（Sランク作品名をコピー）
- [ ] Tier表の公開URL発行・SNS共有
- [ ] カード表示カスタマイズ（タイトルオーバーレイ ON/OFF）

---

## 作者

**Aryu Tamura** — [GitHub](https://github.com/Aryu-Tamura)
