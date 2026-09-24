/* ========================================
   ガチャポケット
   app.js
======================================== */

const STORAGE_KEY = "gacha-pocket-main-v2";


/* ========================================
   SAMPLE DATA
======================================== */

const sampleData = [
  {
    id: 1,
    title: "ぽてっとハムスター",
    releaseDate: "2026-12-01",
    image: "",
    url: "https://x.com/",
    memo: "見つけたら回す！",
    author: "よしの",
    createdAt: 3
  },
  {
    id: 2,
    title: "レトロ喫茶マスコット",
    releaseDate: "2026-11-01",
    image: "",
    url: "https://x.com/",
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


/* ========================================
   STATE
======================================== */

let gachas = loadData();

let currentFilter = "all";

let currentAuthor = "よしの";

let currentImage = "";

let viewMode = "photo";

let savedScrollY = 0;


/* ========================================
   ELEMENTS
======================================== */

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

const closeAddButton =
  document.getElementById("closeAddButton");

const cancelAddButton =
  document.getElementById("cancelAddButton");

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

const urlInput =
  document.getElementById("urlInput");

const memoInput =
  document.getElementById("memoInput");

const toast =
  document.getElementById("toast");

const settingsButton =
  document.getElementById("settingsButton");

const bottomSettings =
  document.getElementById("bottomSettings");

const allGachaButton =
  document.getElementById("allGachaButton");


/* ========================================
   LOAD
======================================== */

function loadData() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

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


/* ========================================
   SAVE
======================================== */

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(gachas)
    );

  } catch (error) {

    console.error(
      "保存エラー",
      error
    );

    alert(
      "保存できませんでした。画像サイズが大きすぎる可能性があります。"
    );

  }

}


/* ========================================
   ESCAPE
======================================== */

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


/* ========================================
   IMAGE PLACEHOLDER

   絵文字・外部画像を使わず
   CSSだけで表示
======================================== */

function createPlaceholder() {

  return `
    <div class="no-image">

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


/* ========================================
   CARD
======================================== */

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
      : createPlaceholder();


  const releaseText =
    item.releaseDate
      ? formatDate(item.releaseDate)
      : "発売日未定";


  return `
    <article
      class="gacha-card"
      data-id="${item.id}"
      tabindex="0"
      role="button"
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
          ${escapeHTML(releaseText)}
        </div>

        <div class="card-memo">
          ${
            escapeHTML(item.memo)
            || "メモなし"
          }
        </div>

      </div>

    </article>
  `;

}


/* ========================================
   DATE
======================================== */

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


/* ========================================
   RENDER
======================================== */

function render() {

  const keyword =
    searchInput
      .value
      .trim()
      .toLowerCase();


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


      const keywordMatch =
        searchText.includes(keyword);


      return (
        authorMatch &&
        keywordMatch
      );

    });


  result = [...result];


  /* 追加順 */

  if (sortSelect.value === "new") {

    result.sort(
      (a, b) =>
        (b.createdAt || 0)
        -
        (a.createdAt || 0)
    );

  }


  /* 発売日順 */

  if (sortSelect.value === "release") {

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


  /* タイトル順 */

  if (sortSelect.value === "title") {

    result.sort(
      (a, b) =>
        a.title.localeCompare(
          b.title,
          "ja"
        )
    );

  }


  cards.innerHTML =
    result
      .map(createCard)
      .join("");


  empty.hidden =
    result.length !== 0;


  if (viewMode === "list") {

    cards.classList.add(
      "list-mode"
    );

  } else {

    cards.classList.remove(
      "list-mode"
    );

  }

}


/* ========================================
   VIEW SWITCH
======================================== */

function setViewMode(mode) {

  viewMode = mode;


  if (mode === "photo") {

    cards.classList.remove(
      "list-mode"
    );

    photoButton
      .classList
      .add("active");

    listButton
      .classList
      .remove("active");

  } else {

    cards.classList.add(
      "list-mode"
    );

    listButton
      .classList
      .add("active");

    photoButton
      .classList
      .remove("active");

  }

}


photoButton.addEventListener(
  "click",
  () => setViewMode("photo")
);


listButton.addEventListener(
  "click",
  () => setViewMode("list")
);


/* ========================================
   SEARCH
======================================== */

searchInput.addEventListener(
  "input",
  render
);


/* ========================================
   SORT
======================================== */

sortSelect.addEventListener(
  "change",
  render
);


/* ========================================
   FILTER
======================================== */

document
  .querySelectorAll(".filter-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentFilter =
          button.dataset.filter;


        document
          .querySelectorAll(
            ".filter-button"
          )
          .forEach(item => {

            item
              .classList
              .remove("active");

          });


        button
          .classList
          .add("active");


        render();

      }
    );

  });


/* ========================================
   iPHONE BODY LOCK

   追加画面を開いた時に
   背景のホームを完全固定する
======================================== */

function lockBackground() {

  savedScrollY =
    window.scrollY ||
    window.pageYOffset ||
    0;


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

  document.body.style.overflow =
    "hidden";

}


function unlockBackground() {

  document.body.style.position =
    "";

  document.body.style.top =
    "";

  document.body.style.left =
    "";

  document.body.style.right =
    "";

  document.body.style.width =
    "";

  document.body.style.overflow =
    "";


  window.scrollTo(
    0,
    savedScrollY
  );

}


/* ========================================
   OPEN ADD
======================================== */

function openAddScreen() {

  resetAddForm();

  lockBackground();


  addScreen
    .classList
    .add("open");


  addScreen.setAttribute(
    "aria-hidden",
    "false"
  );


  const formScreen =
    addScreen.querySelector(
      ".form-screen"
    );


  if (formScreen) {

    formScreen.scrollTop = 0;

  }

}


/* ========================================
   CLOSE ADD
======================================== */

function closeAddScreen() {

  addScreen
    .classList
    .remove("open");


  addScreen.setAttribute(
    "aria-hidden",
    "true"
  );


  unlockBackground();

}


addButton.addEventListener(
  "click",
  openAddScreen
);


closeAddButton.addEventListener(
  "click",
  closeAddScreen
);


cancelAddButton.addEventListener(
  "click",
  closeAddScreen
);


/* ========================================
   AUTHOR
======================================== */

document
  .querySelectorAll(".author-button")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        currentAuthor =
          button.dataset.author;


        document
          .querySelectorAll(
            ".author-button"
          )
          .forEach(item => {

            item
              .classList
              .remove("selected");

          });


        button
          .classList
          .add("selected");

      }
    );

  });


/* ========================================
   IMAGE
======================================== */

imageInput.addEventListener(
  "change",
  event => {

    const file =
      event.target.files[0];


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

      imageInput.value = "";

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      loadEvent => {

        resizeImage(
          loadEvent.target.result,
          resizedImage => {

            currentImage =
              resizedImage;


            imagePreview.src =
              currentImage;


            imagePreview.hidden =
              false;


            imagePlaceholder.hidden =
              true;

          }
        );

      };


    reader.readAsDataURL(file);

  }
);


/* ========================================
   IMAGE RESIZE

   localStorageを圧迫しにくいよう
   iPhone写真を縮小
======================================== */

function resizeImage(
  source,
  callback
) {

  const image =
    new Image();


  image.onload =
    () => {

      const maxSize = 900;

      let width =
        image.width;

      let height =
        image.height;


      if (
        width > maxSize ||
        height > maxSize
      ) {

        const ratio =
          Math.min(
            maxSize / width,
            maxSize / height
          );


        width =
          Math.round(
            width * ratio
          );


        height =
          Math.round(
            height * ratio
          );

      }


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


      const compressed =
        canvas.toDataURL(
          "image/jpeg",
          0.72
        );


      callback(compressed);

    };


  image.src = source;

}


/* ========================================
   ADD NEW GACHA
======================================== */

addForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const title =
      titleInput
        .value
        .trim();


    if (!title) {

      alert(
        "タイトルを入力してね"
      );

      titleInput.focus();

      return;

    }


    const newGacha = {

      id:
        Date.now(),

      title:
        title,

      releaseDate:
        releaseInput.value,

      image:
        currentImage,

      url:
        urlInput
          .value
          .trim(),

      memo:
        memoInput
          .value
          .trim(),

      author:
        currentAuthor,

      createdAt:
        Date.now()

    };


    gachas.unshift(
      newGacha
    );


    saveData();

    render();

    closeAddScreen();


    showToast(
      "ポケットに追加したよ"
    );

  }
);


/* ========================================
   RESET FORM
======================================== */

function resetAddForm() {

  addForm.reset();


  currentAuthor =
    "よしの";


  currentImage =
    "";


  imagePreview.src =
    "";


  imagePreview.hidden =
    true;


  imagePlaceholder.hidden =
    false;


  document
    .querySelectorAll(".author-button")
    .forEach(button => {

      button
        .classList
        .toggle(
          "selected",
          button.dataset.author ===
          "よしの"
        );

    });

}


/* ========================================
   CARD TAP

   現時点ではURLがある場合に開く
======================================== */

cards.addEventListener(
  "click",
  event => {

    const card =
      event.target.closest(
        ".gacha-card"
      );


    if (!card) {
      return;
    }


    const id =
      Number(card.dataset.id);


    const item =
      gachas.find(
        gacha => gacha.id === id
      );


    if (!item) {
      return;
    }


    if (item.url) {

      window.open(
        item.url,
        "_blank",
        "noopener,noreferrer"
      );

      return;

    }


    showToast(
      "このガチャにはURLがまだないよ"
    );

  }
);


/* ========================================
   KEYBOARD CARD ACCESS
======================================== */

cards.addEventListener(
  "keydown",
  event => {

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

    card.click();

  }
);


/* ========================================
   TWO PEOPLE BUTTON
======================================== */

if (allGachaButton) {

  allGachaButton.addEventListener(
    "click",
    () => {

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


/* ========================================
   SETTINGS
======================================== */

function temporarySettings() {

  showToast(
    "設定は次に作るよ"
  );

}


if (settingsButton) {

  settingsButton.addEventListener(
    "click",
    temporarySettings
  );

}


if (bottomSettings) {

  bottomSettings.addEventListener(
    "click",
    temporarySettings
  );

}


/* ========================================
   TOAST
======================================== */

let toastTimer;


function showToast(message) {

  clearTimeout(
    toastTimer
  );


  toast.textContent =
    message;


  toast
    .classList
    .add("show");


  toastTimer =
    setTimeout(
      () => {

        toast
          .classList
          .remove("show");

      },
      1800
    );

}


/* ========================================
   SAFETY

   画面回転などでも
   横位置を変に残さない
======================================== */

window.addEventListener(
  "orientationchange",
  () => {

    setTimeout(
      () => {

        if (
          !addScreen
            .classList
            .contains("open")
        ) {

          window.scrollTo(
            0,
            window.scrollY
          );

        }

      },
      150
    );

  }
);


/* ========================================
   START
======================================== */

render();
