# 職涯定位所

單一 HTML 檔案的職業適性分析網站（個人資料表 → 連續多段測驗 → 結果頁 → PDF 下載），
不需要任何後端或建置流程，`index.html` 用瀏覽器打開即可運作。

## 部署到 GitHub Pages（免費、有公開網址）

1. 到 [github.com/new](https://github.com/new) 建立一個新的 repository（例如取名 `career-fit-site`），
   可以設定成 Public，不需要勾選 "Add a README file"（本資料夾已經有了）。
2. 在這個資料夾（已經是 git repo，也已經完成第一個 commit）依序執行：

   ```bash
   git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
   git branch -M main
   git push -u origin main
   ```

   第一次 push 時如果要求登入，用你的 GitHub 帳號密碼或 Personal Access Token 登入即可
   （GitHub 現在大多要求用 Token 而不是密碼，可以到 GitHub → Settings → Developer settings →
   Personal access tokens 產生一組）。

3. 到 repo 的 **Settings → Pages**，「Build and deployment」的 Source 選擇
   **Deploy from a branch**，Branch 選 `main` / `(root)`，按 Save。
4. 等 1～2 分鐘，GitHub 會給你一個網址，格式通常是：

   ```
   https://<你的帳號>.github.io/<repo名稱>/
   ```

   之後把這個網址分享給任何人，對方直接用瀏覽器打開就能使用完整功能（填資料、測驗、
   結果頁、下載 PDF），不需要安裝任何東西。

## 之後要更新網站內容

之後如果需要調整題目、頁面文字或樣式，把新的 `index.html` 覆蓋掉這個資料夾裡的檔案，
再執行：

```bash
git add index.html
git commit -m "更新網站內容"
git push
```

push 完 GitHub Pages 會自動重新部署，通常一兩分鐘內網址上的內容就會更新。
