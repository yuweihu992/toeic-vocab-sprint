# TOEIC Vocab Sprint

ADHD 友善的 TOEIC 單字練習 PWA — 5 分鐘衝刺、像素戰鬥、本地離線運作。

把單字背成打怪，答對砍敵、答錯被砍。React 18 + TypeScript + Vite + Dexie (IndexedDB)，**完全離線、無後端、無 API key**。

## 特色

- **5 分鐘 Sprint** — 一回合就走完，符合 ADHD 注意力節奏
- **FSRS-6 間隔重複** — 答對的字延後復習，答錯的字馬上回鍋
- **像素戰鬥系統** — 30 名手繪角色、Combo / Fever / Brutality 特效、Web Audio 合成 8-bit 音效
- **本地離線** — 進度存在 IndexedDB，沒有雲端、沒有帳號、沒有追蹤
- **可換單字庫** — 把 `data/vocabulary.json` 換成你自己的就行

## 執行

```bash
npm install
npm run dev      # 本機開發（預設 http://localhost:5173）
npm run build    # 產出 dist/
npm run preview  # 預覽 build
```

需要 Node.js 18+。

## 換成你自己的單字庫

編輯 `data/vocabulary.json`。最小範例見 [`data/vocabulary.example.json`](data/vocabulary.example.json)。

### Schema

```ts
{
  "version": 1,
  "lastUpdated": "YYYY-MM-DD",
  "topics": [
    { "id": "my-topic", "name": "顯示名稱" }
  ],
  "words": [
    {
      "id": "interview",            // 唯一 id（kebab-case）
      "word": "interview",          // 英文單字
      "pos": "n.",                  // 詞性
      "ipa": "/ˈɪn.tə.vjuː/",       // KK / IPA 音標
      "zh": "面試",                 // 中文意思
      "topic": "my-topic",          // 對應 topics[].id
      "difficulty": 2,              // 1-5
      "examples": [
        {
          "en": "I have an ___ scheduled.",  // ___ 是填空位置
          "answer": "interview",
          "zh": "我有一場面試。"
        }
      ],
      "confusables": ["interval"]   // 選填，作為干擾選項池
    }
  ]
}
```

選填欄位：`confusables`、`source`（`{ pdf, page, userWroteAs }`，可用來追蹤你自己的紙本來源）、`doodle`、`needsReview`。

### 想用 Claude Code 從手寫 PDF 自動轉成 JSON？

我自己的工作流是：

1. 把手寫單字 PDF 丟進專案資料夾
2. 開 Claude Code，請它讀 PDF 並輸出符合上面 schema 的 JSON
3. 把產出的 JSON 合併進 `data/vocabulary.json`

這個 repo 不附我的 PDF（個人筆記），但 schema 是公開的，你可以複製這個流程。

## 角色圖鑑

從首頁點「查看角色圖鑑 →」可以看到全部 30 名像素角色（玩家 5 / 求職 8 / 法規 8 / 通用 9），每個都有 6 種動作（待機 / 移動 / 攻擊 / 受擊 / 必殺 / 倒地）。

角色檔案在 [`src/assets/registry/`](src/assets/registry)，每個 `.tsx` 是一個獨立角色，default-export 一個 `CharacterArt`。要新增角色：複製一份現有檔案，改 palette 和 POSES grid，再到 `index.tsx` 註冊就行。

## 技術堆疊

- React 18 + TypeScript（strict）
- Vite 5
- Tailwind CSS 3
- Dexie.js（IndexedDB wrapper）
- ts-fsrs（FSRS-6 間隔重複演算法）
- Web Audio API（合成 8-bit 音效，無音檔）
- SVG 像素藝術（自製 PixelGrid，把同色橫向 run 合併成單一 `<rect>`）

## 目錄結構

```
src/
  pages/         # Home, Sprint, Gallery
  practice/      # 題目產生器（cloze / 多選）
  fsrs/          # FSRS 排程包裝
  battle/        # 戰鬥狀態機 + 敵人定義
  components/    # BattleScene, QuestionCard
  effects/       # 粒子、血濺、震幅、慢動作、閃光、Combo、Fever
  audio/         # Web Audio 合成器
  assets/
    registry/    # 30 個角色（每檔一個）+ index.tsx
    sprites.tsx  # 戰鬥用 sprite (legacy, 給 Sprint 用)
  db/            # Dexie schema
  data/          # vocab loader
  types/
data/
  vocabulary.json          # 你的單字庫（換成自己的）
  vocabulary.example.json  # 最小範例
```

## License

MIT — 拿去隨便用，但別拿去當作弊工具 😅

## 為什麼做這個

我在 NVIDIA 上班、ADHD、需要準備 TOEIC，市面上的 app 對我都太分心或太懲罰性。所以做了這個：規則 ADHD 友善（無扣分、可隨停、5 分鐘上限）、視覺刺激夠（讓多巴胺穩定來）、完全離線（不被廣告打斷）。
