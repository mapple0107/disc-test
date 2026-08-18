/**
 * 職業適性分析網站 — 測驗結果回收用的 Google Apps Script。
 *
 * 每次測試者完成測驗，網站會自動送一筆資料過來，這支程式會：
 *   1. 把個人資料＋分數摘要新增一列到這份 Google 試算表。
 *   2. 把完整結果 PDF 存到你 Google 雲端硬碟裡一個固定的資料夾
 *      （「職業適性分析-PDF結果」），並把下載連結一起加進試算表那一列，
 *      你可以直接從試算表點連結下載每個人的 PDF，也可以直接去雲端硬碟
 *      的那個資料夾裡瀏覽/下載全部檔案。
 *
 * 使用方式：
 * 1. 到 https://sheets.new 建立一個新的 Google 試算表。
 * 2. 上方選單「擴充功能」→「Apps Script」。
 * 3. 把編輯器裡原本的範例程式碼全部刪掉，貼上這個檔案的全部內容。
 * 4. 存檔（Cmd/Ctrl + S）。
 * 5. 右上角「部署」→「新增部署作業」。
 * 6. 齒輪圖示選「網頁應用程式」。
 *    - 執行身份：我
 *    - 誰可以存取：所有人
 * 7. 按「部署」，第一次會要求授權，選你自己的 Google 帳號並允許。
 *    （會看到「Google 尚未驗證這個應用程式」的警告，這是正常的，因為
 *    這是你自己的小工具，點「進階」→「前往...（不安全）」→「允許」即可）
 * 8. 部署完成後會給你一個網址，格式類似：
 *    https://script.google.com/macros/s/AKfycb.......xxx/exec
 *    把這個網址複製起來，貼到 index.html 裡的 RESULT_WEBHOOK_URL。
 *
 * 之後每次測試者完成測驗：
 *   - 試算表會自動新增一列，隨時可以用「檔案」→「下載」匯出成 Excel/CSV。
 *   - PDF 會自動存到你雲端硬碟的「職業適性分析-PDF結果」資料夾，
 *     試算表那一列也會有一欄「PDF結果檔案」放下載連結。
 *
 * 如果之後修改了這支程式碼，記得要「管理部署作業」→ 編輯（鉛筆圖示）
 * → 版本選「新版本」→ 部署，才會生效（網址通常不會變）。
 */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  // 如果這筆資料附帶了 PDF（base64），先解碼存到雲端硬碟固定資料夾，
  // 並把下載連結加進這一列的資料裡，之後就不需要另外保留原始 base64。
  if (data.__pdfBase64) {
    try {
      var folder = getOrCreateResultFolder();
      var fileName = data.__pdfFileName || ("測驗結果_" + new Date().getTime() + ".pdf");
      var blob = Utilities.newBlob(
        Utilities.base64Decode(data.__pdfBase64),
        "application/pdf",
        fileName
      );
      var file = folder.createFile(blob);
      data["PDF結果檔案"] = file.getUrl();
    } catch (err) {
      data["PDF結果檔案"] = "上傳失敗：" + err;
    }
    delete data.__pdfBase64;
    delete data.__pdfFileName;
  }

  // 讀取目前已經存在的欄位標題（第一列）。
  var headers = [];
  var lastCol = sheet.getLastColumn();
  if (sheet.getLastRow() > 0 && lastCol > 0) {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // 如果這筆資料裡有還沒出現過的欄位（例如之後網站新增了測驗段落，
  // 或是第一次出現「PDF結果檔案」欄位），自動把新欄位加到標題列最後面，
  // 不會弄亂舊資料。
  var keys = Object.keys(data);
  var newHeaders = keys.filter(function (k) {
    return headers.indexOf(k) === -1;
  });
  if (newHeaders.length > 0) {
    headers = headers.concat(newHeaders);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  // 依照目前的欄位順序組出這一列的內容。
  var row = headers.map(function (h) {
    return Object.prototype.hasOwnProperty.call(data, h) ? data[h] : "";
  });
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 取得（或第一次自動建立）用來存放 PDF 結果檔案的雲端硬碟資料夾。
// 資料夾名稱固定叫「職業適性分析-PDF結果」，會建立在你的雲端硬碟最上層，
// 之後所有測試者的 PDF 都會集中存在這裡，方便你直接瀏覽或下載。
function getOrCreateResultFolder() {
  var FOLDER_NAME = "職業適性分析-PDF結果";
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}
