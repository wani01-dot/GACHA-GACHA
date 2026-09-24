/* =========================================
   ガチャポケット app.js
   iPhone / GitHub Pages 対応版
========================================= */

const STORAGE_KEY = "gacha-pocket-main-v2";
const SETTINGS_KEY = "gacha-pocket-settings-v1";


/* =========================================
   初期データ
========================================= */

const sampleData = [
  {
    id: 1,
    title: "ぽてっとハムスター",
    releaseDate: "2026-12-01",
    image: "",
    url: "",
    memo: "見つけたら回す！",
    author: "よしの",
    createdAt: 3
  },
  {
    id: 2,
    title: "レトロ喫茶マスコット",
    releaseDate: "2026-11-01",
    image: "",
    url: "",
    memo: "クリームソーダ狙い",
    author: "たけうち",
    createdAt: 2
  },
  {
    id: 3,
    title: "おやすみ動物たち",
    releaseDate: "2026-10-01",
    image: "",
    url: "",
    memo: "全部かわいい",
    author: "よしの",
    createdAt: 1
  }
];


const defaultSettings = {
  user: "よしの",
  view: "photo",
  sort: "new"
};


/* =========================================
   状態
========================================= */

let gachas = loadData();

let settings = loadSettings();

let currentFilter = "all";

let currentAuthor = settings.user;

let currentImage = "";

let viewMode = settings.view;

let editingId = null;

let detailId = null;

let savedScrollY = 0;

let toastTimer = null;


/* =========================================
   DOM取得
========================================= */

const cards =
  document.getElementById("cards");

const empty =
  document.getElementById("empty");

const searchInput =
  document.getElementById("searchInput");

const sortSelect =
  document.getElementById("sortSelect");

const photoButton =
  document.getElementById("photoButton");

const listButton =
  document.getElementById("listButton");

const addButton =
  document.getElementById("addButton");

const addScreen =
  document.getElementById("addScreen");

const detailScreen =
  document.getElementById("detailScreen");

const settingsScreen =
  document.getElementById("settingsScreen");

const addForm =
  document.getElementById("addForm");

const titleInput =
  document.getElementById("titleInput");

const releaseInput =
  document.getElementById("releaseInput");

const imageInput =
  document.getElementById("imageInput");

const imagePreview =
  document.getElementById("imagePreview");

const imagePlaceholder =
  document.getElementById("imagePlaceholder");

const imageSelectedArea =
  document.getElementById("imageSelectedArea");

const selectImageButton =
  document.getElementById("selectImageButton");

const removeImageButton =
  document.getElementById("removeImageButton");

const urlInput =
  document.getElementById("urlInput");

const memoInput =
  document.getElementById("memoInput");

const formScreenTitle =
  document.getElementById("formScreenTitle");

const formScreenSubtitle =
  document.getElementById("formScreenSubtitle");

const saveButton =
  document.getElementById("saveButton");

const toast =
  document.getElementById("toast");


/* =========================================
   localStorage
========================================= */

function loadData() {

  try {

    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [...sampleData];
    }

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [...sampleData];
    }

    return parsed;

  } catch (error) {

    console.error(
      "データ読み込みエラー",
      error
    );

    return [...sampleData];

  }

}


function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(gachas)
    );

    return true;

  } catch (error) {

    console.error(
      "保存エラー",
      error
    );

    alert(
      "保存できませんでした。画像の容量が大きすぎる可能性があります。"
    );

    return false;

  }

}


function loadSettings() {

  try {

    const saved =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (!saved) {
      return {
        ...defaultSettings
      };
    }

    return {
      ...defaultSettings,
      ...JSON.parse(saved)
    };

  } catch {

    return {
      ...defaultSettings
    };

  }

}


function saveSettings() {

  try {

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

  } catch (error) {

    console.error(
      "設定保存エラー",
      error
    );

  }

}


/* =========================================
   共通
========================================= */

function escapeHTML(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]
  );

}


function formatDate(date) {

  if (!date) {
    return "発売日未定";
  }

  const parts =
    date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return (
    Number(parts[0]) +
    "年" +
    Number(parts[1]) +
    "月" +
    Number(parts[2]) +
    "日"
  );

}


/* =========================================
   画像なし表示
========================================= */

function placeholderHTML(
  detail = false
) {

  return `
    <div class="${
      detail
        ? "detail-no-image"
        : "no-image"
    }">

      <div>

        <div
          class="
            capsule-mark
            card-placeholder-capsule
          "
        >
          <span></span>
        </div>

        <div class="no-image-board">
          まだ入ってないよ
        </div>

      </div>

    </div>
  `;

}


/* =========================================
   カード
========================================= */

function createCard(item) {

  const authorClass =
    item.author === "よしの"
      ? "by-yoshino"
      : "by-takeuchi";


  const imageHTML =
    item.image
      ? `
        <img
          class="gacha-image"
          src="${item.image}"
          alt=""
        >
      `
      : placeholderHTML();


  return `
    <article
      class="gacha-card"
      data-id="${item.id}"
      role="button"
      tabindex="0"
    >

      ${imageHTML}

      <span
        class="
          by-badge
          ${authorClass}
        "
      >
        by ${escapeHTML(item.author)}
      </span>

      <div class="card-body">

        <div class="card-title">
          ${escapeHTML(item.title)}
        </div>

        <div class="card-date">
          ${escapeHTML(
            formatDate(
              item.releaseDate
            )
          )}
        </div>

        <div class="card-memo">
          ${
            item.memo
              ? escapeHTML(item.memo)
              : "メモなし"
          }
        </div>

      </div>

    </article>
  `;

}


/* =========================================
   一覧描画
========================================= */

function render() {

  if (!cards) {
    return;
  }

  const keyword =
    searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : "";


  let result =
    gachas.filter(item => {

      const authorMatch =
        currentFilter === "all"
        ||
        item.author === currentFilter;


      const searchText =
        [
          item.title,
          item.memo,
          item.author
        ]
        .join(" ")
        .toLowerCase();


      return (
        authorMatch &&
        searchText.includes(keyword)
      );

    });


  result = [...result];


  const sortValue =
    sortSelect
      ? sortSelect.value
      : settings.sort;


  if (sortValue === "new") {

    result.sort(
      (a, b) =>
        Number(b.createdAt || 0)
        -
        Number(a.createdAt || 0)
    );

  }


  if (sortValue === "release") {

    result.sort(
      (a, b) =>
        (
          a.releaseDate ||
          "9999-99-99"
        ).localeCompare(
          b.releaseDate ||
          "9999-99-99"
        )
    );

  }


  if (sortValue === "title") {

    result.sort(
      (a, b) =>
        String(a.title)
          .localeCompare(
            String(b.title),
            "ja"
          )
    );

  }


  cards.innerHTML =
    result
      .map(createCard)
      .join("");


  if (empty) {

    empty.hidden =
      result.length !== 0;

  }


  cards.classList.toggle(
    "list-mode",
    viewMode === "list"
  );

}


/* =========================================
   写真 / リスト
========================================= */

function setViewMode(
  mode,
  save = true
) {

  viewMode = mode;


  if (photoButton) {

    photoButton.classList.toggle(
      "active",
      mode === "photo"
    );

  }


  if (listButton) {

    listButton.classList.toggle(
      "active",
      mode === "list"
    );

  }


  if (cards) {

    cards.classList.toggle(
      "list-mode",
      mode === "list"
    );

  }


  if (save) {

    settings.view = mode;

    saveSettings();

  }

}


/* =========================================
   オーバーレイ
========================================= */

function lockBackground() {

  if (
    document.body.style.position ===
    "fixed"
  ) {
    return;
  }


  savedScrollY =
    window.scrollY || 0;


  document.body.style.position =
    "fixed";

  document.body.style.top =
    `-${savedScrollY}px`;

  document.body.style.left =
    "0";

  document.body.style.right =
    "0";

  document.body.style.width =
    "100%";

}


function unlockBackground() {

  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";


  window.scrollTo(
    0,
    savedScrollY
  );

}


function openScreen(screen) {

  if (!screen) {
    return;
  }


  lockBackground();


  screen.classList.add("open");


  screen.setAttribute(
    "aria-hidden",
    "false"
  );


  const inner =
    screen.querySelector(
      ".form-screen"
    );


  if (inner) {

    requestAnimationFrame(
      () => {
        inner.scrollTop = 0;
      }
    );

  }

}


function closeScreen(
  screen,
  unlock = true
) {

  if (!screen) {
    return;
  }


  screen.classList.remove(
    "open"
  );


  screen.setAttribute(
    "aria-hidden",
    "true"
  );


  if (unlock) {

    const anotherOpen =
      document.querySelector(
        ".screen-overlay.open"
      );


    if (!anotherOpen) {
      unlockBackground();
    }

  }

}


/* =========================================
   入力者
========================================= */

function setAuthor(author) {

  currentAuthor =
    author;


  document
    .querySelectorAll(
      ".author-button"
    )
    .forEach(button => {

      button.classList.toggle(
        "selected",
        button.dataset.author ===
          author
      );

    });

}


/* =========================================
   画像UI
========================================= */

function updateImageUI() {

  const hasImage =
    typeof currentImage ===
      "string"
    &&
    currentImage.length > 20;


  if (imagePlaceholder) {

    imagePlaceholder.style.display =
      hasImage
        ? "none"
        : "flex";

    imagePlaceholder.hidden =
      hasImage;

  }


  if (imageSelectedArea) {

    imageSelectedArea.style.display =
      hasImage
        ? "block"
        : "none";

    imageSelectedArea.hidden =
      !hasImage;

  }


  if (selectImageButton) {

    selectImageButton.style.display =
      hasImage
        ? "none"
        : "flex";

    selectImageButton.hidden =
      hasImage;

  }


  if (imagePreview) {

    if (hasImage) {

      imagePreview.src =
        currentImage;

      imagePreview.style.display =
        "block";

    } else {

      imagePreview.removeAttribute(
        "src"
      );

      imagePreview.style.display =
        "none";

    }

  }

}


/* =========================================
   画像圧縮
========================================= */

function compressImage(
  dataURL,
  callback
) {

  const image =
    new Image();


  image.onload =
    function () {

      const MAX_WIDTH = 900;
      const MAX_HEIGHT = 900;


      let width =
        image.naturalWidth;

      let height =
        image.naturalHeight;


      const ratio =
        Math.min(
          1,
          MAX_WIDTH / width,
          MAX_HEIGHT / height
        );


      width =
        Math.round(
          width * ratio
        );


      height =
        Math.round(
          height * ratio
        );


      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        width;

      canvas.height =
        height;


      const context =
        canvas.getContext("2d");


      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );


      let compressed;


      try {

        compressed =
          canvas.toDataURL(
            "image/jpeg",
            0.72
          );

      } catch {

        compressed =
          dataURL;

      }


      callback(
        compressed
      );

    };


  image.onerror =
    function () {

      callback(
        dataURL
      );

    };


  image.src =
    dataURL;

}


/* =========================================
   画像選択
========================================= */

if (imageInput) {

  imageInput.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];


      if (!file) {
        return;
      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        alert(
          "画像ファイルを選んでね"
        );

        this.value = "";

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          const source =
            event.target.result;


          /*
            まず選択直後に表示する。

            iPhoneで
            「選んだのに何も変わらない」
            状態を防ぐ。
          */

          currentImage =
            source;


          updateImageUI();


          /*
            その後で軽量化。
          */

          compressImage(
            source,
            function (compressed) {

              currentImage =
                compressed;


              updateImageUI();

            }
          );

        };


      reader.onerror =
        function () {

          alert(
            "画像を読み込めませんでした。もう一度選んでね。"
          );

      };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================
   画像削除
========================================= */

if (removeImageButton) {

  removeImageButton.addEventListener(
    "click",
    function (event) {

      event.preventDefault();
      event.stopPropagation();


      currentImage = "";


      if (imageInput) {
        imageInput.value = "";
      }


      updateImageUI();

    }
  );

}


/* =========================================
   新規追加
========================================= */

function openAddScreen() {

  editingId = null;


  if (addForm) {
    addForm.reset();
  }


  currentImage = "";


  setAuthor(
    settings.user || "よしの"
  );


  updateImageUI();


  if (formScreenTitle) {

    formScreenTitle.textContent =
      "ガチャを追加";

  }


  if (formScreenSubtitle) {

    formScreenSubtitle.textContent =
      "ポケットに入れておこう";

  }


  if (saveButton) {

    saveButton.innerHTML =
      `
        <span class="mini-capsule"></span>
        ポケットに入れる
      `;

  }


  openScreen(
    addScreen
  );

}


/* =========================================
   保存
========================================= */

if (addForm) {

  addForm.addEventListener(
    "submit",
    function (event) {

      event.preventDefault();


      const title =
        titleInput
          ? titleInput.value.trim()
          : "";


      if (!title) {

        if (titleInput) {
          titleInput.focus();
        }

        return;

      }


      let savedId;


      if (editingId !== null) {

        const index =
          gachas.findIndex(
            item =>
              String(item.id) ===
              String(editingId)
          );


        if (index === -1) {
          return;
        }


        gachas[index] = {

          ...gachas[index],

          title,

          releaseDate:
            releaseInput
              ? releaseInput.value
              : "",

          image:
            currentImage || "",

          url:
            urlInput
              ? urlInput.value.trim()
              : "",

          memo:
            memoInput
              ? memoInput.value.trim()
              : "",

          author:
            currentAuthor

        };


        savedId =
          gachas[index].id;

      } else {

        savedId =
          Date.now();


        const newItem = {

          id:
            savedId,

          title,

          releaseDate:
            releaseInput
              ? releaseInput.value
              : "",

          image:
            currentImage || "",

          url:
            urlInput
              ? urlInput.value.trim()
              : "",

          memo:
            memoInput
              ? memoInput.value.trim()
              : "",

          author:
            currentAuthor,

          createdAt:
            Date.now()

        };


        gachas.unshift(
          newItem
        );

      }


      const saved =
        saveData();


      if (!saved) {
        return;
      }


      render();


      /*
        追加画面を閉じるが、
        bodyのロックは維持。
      */

      closeScreen(
        addScreen,
        false
      );


      /*
        次の描画フレームで
        詳細画面を開く。

        Safari対策。
      */

      requestAnimationFrame(
        function () {

          requestAnimationFrame(
            function () {

              showDetail(
                savedId
              );

              showToast(
                editingId !== null
                  ? "変更を保存したよ"
                  : "ポケットに入れたよ"
              );


              editingId =
                null;

            }
          );

        }
      );

    }
  );

}


/* =========================================
   詳細画面
========================================= */

function showDetail(id) {

  const item =
    gachas.find(
      gacha =>
        String(gacha.id) ===
        String(id)
    );


  if (!item) {

    console.error(
      "詳細データが見つかりません",
      id
    );

    return;

  }


  detailId =
    item.id;


  const detailImageArea =
    document.getElementById(
      "detailImageArea"
    );


  if (detailImageArea) {

    if (item.image) {

      detailImageArea.innerHTML =
        `
          <img
            class="detail-image"
            src="${item.image}"
            alt="${escapeHTML(
              item.title
            )}"
          >
        `;

    } else {

      detailImageArea.innerHTML =
        placeholderHTML(true);

    }

  }


  const detailAuthor =
    document.getElementById(
      "detailAuthor"
    );


  if (detailAuthor) {

    detailAuthor.textContent =
      `by ${item.author}`;


    detailAuthor.className =
      "detail-author " +
      (
        item.author === "よしの"
          ? "by-yoshino"
          : "by-takeuchi"
      );

  }


  const detailTitle =
    document.getElementById(
      "detailTitle"
    );


  if (detailTitle) {

    detailTitle.textContent =
      item.title || "";

  }


  const detailDate =
    document.getElementById(
      "detailDate"
    );


  if (detailDate) {

    detailDate.textContent =
      formatDate(
        item.releaseDate
      );

  }


  const detailRelease =
    document.getElementById(
      "detailRelease"
    );


  if (detailRelease) {

    detailRelease.textContent =
      item.releaseDate
        ? "発売予定"
        : "発売日未定";

  }


  const detailMemo =
    document.getElementById(
      "detailMemo"
    );


  if (detailMemo) {

    detailMemo.textContent =
      item.memo ||
      "メモなし";

  }


  const detailUrlText =
    document.getElementById(
      "detailUrlText"
    );


  if (detailUrlText) {

    detailUrlText.textContent =
      item.url ||
      "URL未登録";

  }


  const openUrlButton =
    document.getElementById(
      "openUrlButton"
    );


  if (openUrlButton) {

    openUrlButton.disabled =
      !item.url;

  }


  openScreen(
    detailScreen
  );

}


/* =========================================
   カードタップ

   clickをカード生成後に毎回
   付け直すのではなく、
   親要素で受け取る。
========================================= */

if (cards) {

  cards.addEventListener(
    "click",
    function (event) {

      const card =
        event.target.closest(
          ".gacha-card"
        );


      if (!card) {
        return;
      }


      event.preventDefault();


      const id =
        card.dataset.id;


      showDetail(id);

    }
  );


  cards.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }


      const card =
        event.target.closest(
          ".gacha-card"
        );


      if (!card) {
        return;
      }


      event.preventDefault();


      showDetail(
        card.dataset.id
      );

    }
  );

}


/* =========================================
   URL
========================================= */

const openUrlButton =
  document.getElementById(
    "openUrlButton"
  );


if (openUrlButton) {

  openUrlButton.addEventListener(
    "click",
    function () {

      const item =
        gachas.find(
          gacha =>
            String(gacha.id) ===
            String(detailId)
        );


      if (!item) {
        return;
      }


      if (!item.url) {

        showToast(
          "このガチャにはURLがまだないよ"
        );

        return;

      }


      window.open(
        item.url,
        "_blank",
        "noopener,noreferrer"
      );

    }
  );

}


/* =========================================
   編集
========================================= */

const editButton =
  document.getElementById(
    "editButton"
  );


if (editButton) {

  editButton.addEventListener(
    "click",
    function () {

      const item =
        gachas.find(
          gacha =>
            String(gacha.id) ===
            String(detailId)
        );


      if (!item) {
        return;
      }


      editingId =
        item.id;


      if (titleInput) {
        titleInput.value =
          item.title || "";
      }


      if (releaseInput) {
        releaseInput.value =
          item.releaseDate || "";
      }


      if (urlInput) {
        urlInput.value =
          item.url || "";
      }


      if (memoInput) {
        memoInput.value =
          item.memo || "";
      }


      currentImage =
        item.image || "";


      setAuthor(
        item.author ||
        settings.user
      );


      updateImageUI();


      if (formScreenTitle) {

        formScreenTitle.textContent =
          "ガチャを編集";

      }


      if (formScreenSubtitle) {

        formScreenSubtitle.textContent =
          "ポケットの中身を更新";

      }


      if (saveButton) {

        saveButton.innerHTML =
          `
            <span class="mini-capsule"></span>
            変更を保存
          `;

      }


      closeScreen(
        detailScreen,
        false
      );


      requestAnimationFrame(
        function () {

          openScreen(
            addScreen
          );

        }
      );

    }
  );

}


/* =========================================
   削除
========================================= */

const deleteButton =
  document.getElementById(
    "deleteButton"
  );


if (deleteButton) {

  deleteButton.addEventListener(
    "click",
    function () {

      const item =
        gachas.find(
          gacha =>
            String(gacha.id) ===
            String(detailId)
        );


      if (!item) {
        return;
      }


      const ok =
        confirm(
          `「${item.title}」を削除する？`
        );


      if (!ok) {
        return;
      }


      gachas =
        gachas.filter(
          gacha =>
            String(gacha.id) !==
            String(detailId)
        );


      saveData();

      render();


      closeScreen(
        detailScreen
      );


      detailId =
        null;


      showToast(
        "ガチャを削除したよ"
      );

    }
  );

}


/* =========================================
   設定
========================================= */

function updateStats() {

  const totalCount =
    document.getElementById(
      "totalCount"
    );

  const yoshinoCount =
    document.getElementById(
      "yoshinoCount"
    );

  const takeuchiCount =
    document.getElementById(
      "takeuchiCount"
    );


  if (totalCount) {

    totalCount.textContent =
      gachas.length;

  }


  if (yoshinoCount) {

    yoshinoCount.textContent =
      gachas.filter(
        item =>
          item.author ===
          "よしの"
      ).length;

  }


  if (takeuchiCount) {

    takeuchiCount.textContent =
      gachas.filter(
        item =>
          item.author ===
          "たけうち"
      ).length;

  }

}


function updateSettingsUI() {

  document
    .querySelectorAll(
      ".settings-user-button"
    )
    .forEach(button => {

      button.classList.toggle(
        "selected",
        button.dataset.user ===
          settings.user
      );

    });


  const defaultViewSelect =
    document.getElementById(
      "defaultViewSelect"
    );


  if (defaultViewSelect) {

    defaultViewSelect.value =
      settings.view;

  }


  const defaultSortSelect =
    document.getElementById(
      "defaultSortSelect"
    );


  if (defaultSortSelect) {

    defaultSortSelect.value =
      settings.sort;

  }


  updateStats();

}


function openSettings() {

  updateSettingsUI();

  openScreen(
    settingsScreen
  );

}


/* =========================================
   イベント登録
========================================= */

if (addButton) {

  addButton.addEventListener(
    "click",
    openAddScreen
  );

}


document
  .querySelectorAll(
    ".author-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        setAuthor(
          this.dataset.author
        );

      }
    );

  });


if (photoButton) {

  photoButton.addEventListener(
    "click",
    function () {

      setViewMode(
        "photo"
      );

    }
  );

}


if (listButton) {

  listButton.addEventListener(
    "click",
    function () {

      setViewMode(
        "list"
      );

    }
  );

}


if (searchInput) {

  searchInput.addEventListener(
    "input",
    render
  );

}


if (sortSelect) {

  sortSelect.addEventListener(
    "change",
    function () {

      settings.sort =
        this.value;

      saveSettings();

      render();

    }
  );

}


document
  .querySelectorAll(
    ".filter-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        currentFilter =
          this.dataset.filter;


        document
          .querySelectorAll(
            ".filter-button"
          )
          .forEach(item => {

            item.classList.toggle(
              "active",
              item === button
            );

          });


        render();

      }
    );

  });


/* =========================================
   設定ボタン
========================================= */

const settingsButton =
  document.getElementById(
    "settingsButton"
  );

const bottomSettings =
  document.getElementById(
    "bottomSettings"
  );


if (settingsButton) {

  settingsButton.addEventListener(
    "click",
    openSettings
  );

}


if (bottomSettings) {

  bottomSettings.addEventListener(
    "click",
    openSettings
  );

}


/* =========================================
   設定ユーザー
========================================= */

document
  .querySelectorAll(
    ".settings-user-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        settings.user =
          this.dataset.user;

        currentAuthor =
          settings.user;

        saveSettings();

        updateSettingsUI();

      }
    );

  });


const defaultViewSelect =
  document.getElementById(
    "defaultViewSelect"
  );


if (defaultViewSelect) {

  defaultViewSelect.addEventListener(
    "change",
    function () {

      settings.view =
        this.value;

      saveSettings();

      setViewMode(
        settings.view,
        false
      );

    }
  );

}


const defaultSortSelect =
  document.getElementById(
    "defaultSortSelect"
  );


if (defaultSortSelect) {

  defaultSortSelect.addEventListener(
    "change",
    function () {

      settings.sort =
        this.value;

      saveSettings();


      if (sortSelect) {

        sortSelect.value =
          settings.sort;

      }


      render();

    }
  );

}


/* =========================================
   全削除
========================================= */

const deleteAllButton =
  document.getElementById(
    "deleteAllButton"
  );


if (deleteAllButton) {

  deleteAllButton.addEventListener(
    "click",
    function () {

      const ok =
        confirm(
          "登録しているガチャをすべて削除する？この操作は元に戻せません。"
        );


      if (!ok) {
        return;
      }


      gachas = [];


      saveData();

      render();

      updateStats();


      showToast(
        "登録データをすべて削除したよ"
      );

    }
  );

}


/* =========================================
   閉じる
========================================= */

function bindClose(
  id,
  screen
) {

  const button =
    document.getElementById(id);


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    function () {

      closeScreen(
        screen
      );

    }
  );

}


bindClose(
  "closeAddButton",
  addScreen
);

bindClose(
  "cancelAddButton",
  addScreen
);

bindClose(
  "closeDetailButton",
  detailScreen
);

bindClose(
  "closeSettingsButton",
  settingsScreen
);


/* =========================================
   下部ナビ
========================================= */

const homeButton =
  document.getElementById(
    "homeButton"
  );


if (homeButton) {

  homeButton.addEventListener(
    "click",
    function () {

      currentFilter =
        "all";


      document
        .querySelectorAll(
          ".filter-button"
        )
        .forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.filter ===
              "all"
          );

        });


      render();


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


const allGachaButton =
  document.getElementById(
    "allGachaButton"
  );


if (allGachaButton) {

  allGachaButton.addEventListener(
    "click",
    function () {

      currentFilter =
        "all";


      if (searchInput) {
        searchInput.value = "";
      }


      document
        .querySelectorAll(
          ".filter-button"
        )
        .forEach(button => {

          button.classList.toggle(
            "active",
            button.dataset.filter ===
              "all"
          );

        });


      render();


      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

  if (!toast) {
    return;
  }


  clearTimeout(
    toastTimer
  );


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  toastTimer =
    setTimeout(
      function () {

        toast.classList.remove(
          "show"
        );

      },
      1800
    );

}


/* =========================================
   起動
========================================= */

if (sortSelect) {

  sortSelect.value =
    settings.sort;

}


setViewMode(
  settings.view,
  false
);


updateImageUI();

render();
