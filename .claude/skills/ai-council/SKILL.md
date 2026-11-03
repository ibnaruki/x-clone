---
name: ai-council
description: Codex(GPT)とGeminiに同じ質問を投げて、Claudeが比較・検証してまとめる「AI会議」。ユーザーが「AI会議」「他のAIにも聞いて」「セカンドオピニオン」「GPTとGeminiの意見も」と言ったとき、または重要な判断・調査で複数の視点が欲しいときに使う。
---

# AI会議（Claude + Codex + Gemini）

Claude が司令塔。Codex CLI（ChatGPTプラン）と Gemini CLI（Googleアカウント）に
同じ問いを並列で投げ、結果を突き合わせて結論を出す。どちらも定額/無料枠で動き、従量課金はしない。

## 手順

### 1. 問いを整える
ユーザーの依頼を、前提知識なしで答えられる1つのプロンプトにまとめる。
- 背景・目的・制約・欲しい出力形式を含める
- 必要ならファイルの中身を貼り込む（各AIは会話の文脈を知らない）
- 最後に「結論→理由→不確かな点 の順で、日本語で簡潔に答えて」と付ける

### 2. 2つのAIに並列で聞く
Bash ツールで **1回のコマンド** にまとめて実行する（timeout は 600000 を指定）。
どちらも読み取り専用モードで動かし、ファイルを書き換えさせない。

```bash
D=$(mktemp -d)
cat > "$D/q.txt" <<'EOF'
（ここに整えたプロンプト）
EOF
codex exec --skip-git-repo-check -s read-only -o "$D/codex.md" - < "$D/q.txt" > "$D/codex.log" 2>&1 &
gemini -m flash --approval-mode plan -p "$(cat "$D/q.txt")" > "$D/gemini.md" 2> "$D/gemini.log" &
wait
echo "===== CODEX ====="; cat "$D/codex.md"
echo "===== GEMINI ====="; cat "$D/gemini.md"
```

- 片方が失敗したら、`codex.log` / `gemini.log` を見て原因を伝え、もう片方の結果だけで進める
- `command not found` やログイン切れなら、下の「セットアップ」をユーザーに案内する

### 3. Claude が比較・検証する
- **一致した点**：信頼度高として採用
- **食い違った点**：どちらが正しいか、自分で根拠を確認（ファイルを読む、Web検索するなど）して判定する
- **片方だけが出した点**：有用なら拾い、根拠が弱ければ「要確認」とする
- 自分（Claude）の意見も1票として加える。多数決ではなく根拠で決める

### 4. ユーザーへの報告
次の形でまとめる。各AIの全文は貼らない（求められたら出す）。

```
結論：…
一致：…
食い違い：… → 判定：…（理由）
要確認：…
```

## 役割分担の目安
- Codex（GPT）：コードレビュー、実装案、論理チェック
- Gemini：無料枠のため Flash を使う（Auto/Pro は無料枠で止まる）。長い資料の読み込み、Google検索を使った調べ物、最新情報
- 片方だけで足りる依頼（例：「Geminiで調べて」）は、その1つだけ呼ぶ

## セットアップ（初回のみ・PCのターミナルで）
```bash
npm install -g @openai/codex @google/gemini-cli
codex login     # 「Sign in with ChatGPT」を選ぶ
```
Gemini は個人Googleアカウントでのログインが廃止されたため、無料のAPIキーを使う：
1. https://aistudio.google.com/apikey で新規プロジェクトにキーを作成（支払い設定はしない）
2. PowerShell で `setx GEMINI_API_KEY "キー"` → PowerShell を開き直す
3. `gemini` を起動し「Use Gemini API Key」を選ぶ
