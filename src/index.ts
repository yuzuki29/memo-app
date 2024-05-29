import { readLocalStorage, saveLocalStorage, STORAGE_KEY } from "./storage";
import { Memo } from "./types";
import { marked } from "marked";
// ****************************************************
// 要素一覧
// ****************************************************

const memmolist = document.getElementById("list") as HTMLDivElement;
const addButton = document.getElementById("add") as HTMLButtonElement;
const editButton = document.getElementById("edit") as HTMLButtonElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const deleteButton = document.getElementById("delete") as HTMLButtonElement;
const memoTitle = document.getElementById("memoTitle") as HTMLInputElement;
const memoBody = document.getElementById("memoBody") as HTMLTextAreaElement;
const previewBody = document.getElementById("previewBody") as HTMLDivElement;
const downloadLink = document.getElementById("download") as HTMLAnchorElement;

// ****************************************************
// 処理
// ****************************************************

let memos: Memo[] = [];
let memoIndex: number = 0;
downloadLink.addEventListener("click", clickDownloadMemo);
deleteButton.addEventListener("click", cliclDeleteMemo);
addButton.addEventListener("click", clickAddMemo);
editButton.addEventListener("click", clickEditMemo);
saveButton.addEventListener("click", clickSaveMemo);
init();

// ****************************************************
// 関数一覧
// ****************************************************

// 新しいメモを作成する
function newMemo(): Memo {
  const timestanp: number = Date.now();
  return {
    id: timestanp.toString() + memos.length.toString(),
    title: `new memo ${memos.length + 1}`,
    body: "",
    createdAt: timestanp,
    updatedAt: timestanp,
  };
}

// 初期化する
function init() {
  // すべてのメモをローカルストレージから取得する
  memos = readLocalStorage(STORAGE_KEY);
  console.log(memos);
  if (memos.length === 0) {
    // 新しいメモを２つ作成する
    memos.push(newMemo());
    memos.push(newMemo());
    // すべてのメモをローカルストレージに保存する
    saveLocalStorage(STORAGE_KEY, memos);
  }
  console.log(memos);
  //   すべてのメモのタイトルをメモ一覧に表示する
  showMemoElements(memmolist, memos);
  // メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  // 選択中のメモ情報を表現用のメモ要素に設定する
  setMemoElement();
  // 保存ボタンを非表示にし編集ボタンを表示する
  setHiddenBuuton(saveButton, false);
  setHiddenBuuton(editButton, true);
}

// メモの要素を作成する
function newMemoElement(memo: Memo): HTMLDivElement {
  // div要素を作成する
  const div = document.createElement("div");
  // div要素にタイトルを設定する
  div.innerText = memo.title;
  // div要素の中のdata-id属性にメモIDを設定する
  div.setAttribute("data-id", memo.id);
  // div要素のclass属性にスタイルを設定する
  div.classList.add("w-full", "p-sm");
  div.addEventListener("click", selectedMemo);
  return div;
}

// すべてのメモ要素を削除する
function clearMemoElements(div: HTMLDivElement) {
  div.innerText = "";
}
// すべてのメモを表示する
function showMemoElements(div: HTMLDivElement, memo: Memo[]) {
  // メモ一覧をクリックする
  clearMemoElements(div);
  memos.forEach((memo) => {
    // メモのタイトルの要素を作成する
    const memoElement = newMemoElement(memo);
    // メモ一覧の末尾にメモのタイトルの要素を追加する
    div.appendChild(memoElement);
  });
}

//div要素にアクティブスタイル設定する
function setActiveStyle(index: number, isActive: boolean) {
  const selector = `#list > div:nth-child(${index})`;
  const element = document.querySelector(selector) as HTMLDivElement;
  if (isActive) {
    element.classList.add("active");
  } else {
    element.classList.remove("active");
  }
}

// メモを設定する
function setMemoElement() {
  const memo: Memo = memos[memoIndex];
  // メモを表示する要素にタイトルと本文を設定する
  memoTitle.value = memo.title;
  memoBody.value = memo.body;
  // markdownで記述した本文(文字列)をHTMLにパースする
  (async () => {
    try {
      previewBody.innerHTML = await marked.parse(memo.body);
    } catch (error) {
      console.error(error);
    }
  })();
}

// button要素の表示・非表示を設定する
function setHiddenBuuton(button: HTMLButtonElement, isHidden: boolean) {
  if (isHidden) {
    button.removeAttribute("hidden");
  } else {
    button.setAttribute("hidden", "hidden");
  }
}

// タイトルと本文の要素のdisable属性を設定する
function setEditMode(editMode: boolean) {
  if (editMode) {
    memoTitle.removeAttribute("disabled");
    memoBody.removeAttribute("disabled");
    // 編集モード時はtextareaを表示し、プレビュー用を非表示にする
    memoBody.removeAttribute("hidden");
    previewBody.setAttribute("hidden", "hidden");
  } else {
    memoTitle.setAttribute("disabled", "disabled");
    memoBody.setAttribute("disabled", "disabled");
    // 編集モード時はtextareaを非表示し、プレビュー用を表示にする
    memoBody.setAttribute("hidden", "hidden");
    previewBody.removeAttribute("hidden");
  }
}

// ****************************************************
// イベント関連の関数一覧
// ****************************************************

function clickAddMemo(event: MouseEvent) {
  // タイトルと本文を編集モードにする
  setEditMode(true);
  // 保存ボタンを表示し編集ボタンを非表示にする
  setHiddenBuuton(saveButton, true);
  setHiddenBuuton(editButton, false);

  // 新しいメモを追加する
  memos.push(newMemo());
  // すべてのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  // 新しいメモが追加されたインデックスを設定する
  memoIndex = memos.length - 1;
  // すべてのメモのタイトルをメモ一覧に表示する
  showMemoElements(memmolist, memos);
  // メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
  // 選択中のメモ情報を表現用のメモ要素に設定する
  setMemoElement();
}

// メモが選択された時の処理
function selectedMemo(event: MouseEvent) {
  // タイトルと本文を表示モードにする
  setEditMode(false);
  // 保存ボタンを非表示にし編集ボタンを表示する
  setHiddenBuuton(saveButton, false);
  setHiddenBuuton(editButton, true);

  // メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, false);
  // クリックされたdiv要素のdata-id属性からメモIDを取得する
  const target = event.target as HTMLDivElement;
  const id = target.getAttribute("data-id");
  // 選択されたメモのインデックスを取得する
  memoIndex = memos.findIndex((memo) => memo.id === id);
  // 選択中のメモ情報を表示用のメモ要素に設定する
  setMemoElement();
  // メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
}

// 編集ボタンが押された時の処理
function clickEditMemo(event: MouseEvent) {
  // タイトルと本文を編集モードにする
  setEditMode(true);
  // 保存ボタンを表示し編集ボタンを非表示にする
  setHiddenBuuton(saveButton, true);
  setHiddenBuuton(editButton, false);
}

// 保存ボタンが押された時の処理
function clickSaveMemo(event: MouseEvent) {
  const memo: Memo = memos[memoIndex];
  memo.title = memoTitle.value;
  memo.body = memoBody.value;
  memo.updatedAt = Date.now();
  //すべてのメモをローカルストレージに保存する
  saveLocalStorage(STORAGE_KEY, memos);
  //タイトルと本文を表示モードにする
  setEditMode(false);
  //保存ボタン非表示にし編集ボタンを表示する
  setHiddenBuuton(saveButton, false);
  setHiddenBuuton(editButton, true);
  //すべてのメモタイトルを一覧で表示する
  showMemoElements(memmolist, memos);
  //メモ一覧のタイトルにアクティブなスタイルを設定する
  setActiveStyle((memoIndex = 1), true);
  // 表示するメモを設定する
  setMemoElement();
}

// 削除
function cliclDeleteMemo(event: MouseEvent) {
  if (memos.length === 1) {
    alert("これ以上は削除できません");
    return;
  }
  //表示中のメモのIDを取得する
  const mmemoId = memos[memoIndex].id;
  memos = memos.filter((memo) => memo.id !== mmemoId);
  //すべてのメモから表示中のメモを削除する
  saveLocalStorage(STORAGE_KEY, memos);
  // すべてのメモをローカルストレージに保存する
  if (1 <= memoIndex) {
    // 表示するメモのインデックスを1つ前の物にする
    memoIndex--;
  }
  // 表示するメモを取得する
  setMemoElement();
  // 画面右側を表示モードにする
  setEditMode(false);
  // 保存ボタンを非表示にし編集ボタンを表示する
  setHiddenBuuton(saveButton, false);
  setHiddenBuuton(editButton, true);
  // 画面左側のメモのタイトル一覧をクリアして再構築する
  showMemoElements(memmolist, memos);
  // 表示するメモのタイトルにアクティブなスタイルを設定する
  setActiveStyle(memoIndex + 1, true);
}

// ダウンロードのリンクがクリックされた時の処理
function clickDownloadMemo(event: MouseEvent) {
  // ダウンロードを取得する
  const memo = memos[memoIndex];
  // イベントが発生した要素を取得する
  const target = event.target as HTMLAnchorElement;
  // ダウンロードするファイルの名前を指定する
  target.download = `${memo.title}.md`;
// ダウンロードするファイルのデータを設定する
  target.href = URL.createObjectURL(
    new Blob([memo.body], {
      type: "application/octet-stream",
    })
  );
}
