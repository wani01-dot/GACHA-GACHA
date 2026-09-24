/* ========================================
   ガチャポケット
   app.js
======================================== */

const STORAGE_KEY = "gacha-pocket-main";


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


/* ========================================
   ELEMENT
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

      return [
        ...sampleData
      ];

    }

    const parsed =
      JSON.parse(saved);

    if (
      !Array.isArray(parsed)
    ) {

      return [
        ...sampleData
      ];

    }

    return parsed;

  } catch (error) {

    console.error(
      "データ読み込みエラー",
      error
    );

    return [
      ...sampleData
    ];

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
      "データを保存できませんでした。画像サイズが大きすぎる可能性があります。"
    );

  }

}


/* ========================================
   ESCAPE HTML
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
   NO IMAGE
======================================== */

function createPlaceholder() {

  return `
    <div class="no-image">

      <div>

        <span
          class="no-image-animal"
        >
          🐹
        </span>

        <span
          class="no-image-board"
        >
          まだ入ってないよ
        </span>

      </div>

    </div>
  `;

}


/* ========================================
   CREATE CARD
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

      ? formatDate(
          item.releaseDate
        )

      : "発売日未定";


  return `
    <article
      class="gacha-card"
      data-id="${item.id}"
    >

      ${imageHTML}

      <span
        class="
          by-badge
          ${authorClass}
        "
      >
        by
        ${escapeHTML(
          item.author
        )}
      </span>


      <div class="card-body">

        <div class="card-title">

          ${escapeHTML(
            item.title
          )}

        </div>


        <div class="card-date">

          📅
          ${releaseText}

        </div>


        <div class="card-memo">

          ${
            escapeHTML(
              item.memo
            )
            ||
            "メモなし"
          }

        </div>

      </div>

    </article>
  `;

}


/* ========================================
   FORMAT DATE
======================================== */

function formatDate(date) {

  if (!date) {
    return "発売日未定";
  }

  const parts =
    date.split("-");

  if (
    parts.length !== 3
  ) {

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
    gachas.filter(
      item => {

        const authorMatch =

          currentFilter ===
          "all"

          ||

          item.author ===
          currentFilter;


        const searchText =
          `
            ${item.title}
            ${item.memo}
            ${item.author}
          `
          .toLowerCase();


        const keywordMatch =
          searchText.includes(
            keyword
          );


        return (
          authorMatch &&
          keywordMatch
        );

      }
    );


  /* SORT */

  result =
    [...result];


  if (
    sortSelect.value ===
    "new"
  ) {

    result.sort(
      (a, b) =>

        (
          b.createdAt ||
          0
        )

        -

        (
          a.createdAt ||
          0
        )
    );

  }


  if (
    sortSelect.value ===
    "release"
  ) {

    result.sort(
      (a, b) =>

        (
          a.releaseDate ||
          "9999-99-99"
        )
        .localeCompare(

          b.releaseDate ||
          "9999-99-99"

        )
    );

  }


  if (
    sortSelect.value ===
    "title"
  ) {

    result.sort(
      (a, b) =>

        a.title.localeCompare(
          b.title,
          "ja"
        )
    );

  }


  /* DRAW */

  cards.innerHTML =
    result
      .map(createCard)
      .join("");


  empty.hidden =
    result.length !== 0;


  saveData();

}


/* ========================================
   PHOTO MODE
======================================== */

photoButton.addEventListener(
  "click",
  () => {

    viewMode =
      "photo";

    cards.classList.remove(
      "list-mode"
    );

    photoButton
      .classList
      .add("active");

    listButton
      .classList
      .remove("active");

  }
);


/* ========================================
   LIST MODE
======================================== */

listButton.addEventListener(
  "click",
  () => {

    viewMode =
      "list";

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
  .querySelectorAll(
    ".filter-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          currentFilter =
            button.dataset.filter;


          document
            .querySelectorAll(
              ".filter-button"
            )
            .forEach(
              item => {

                item
                  .classList
                  .remove(
                    "active"
                  );

              }
            );


          button
            .classList
            .add(
              "active"
            );


          render();

        }
      );

    }
  );


/* ========================================
   OPEN ADD SCREEN
======================================== */

function openAddScreen() {

  resetAddForm();

  addScreen
    .classList
    .add(
      "open"
    );


  addScreen.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.style.overflow =
    "hidden";


  setTimeout(
    () => {

      titleInput.focus();

    },
    200
  );

}


addButton.addEventListener(
  "click",
  openAddScreen
);


/* ========================================
   CLOSE ADD SCREEN
======================================== */

function closeAddScreen() {

  addScreen
    .classList
    .remove(
      "open"
    );


  addScreen.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.style.overflow =
    "";

}


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
  .querySelectorAll(
    ".author-button"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          currentAuthor =
            button.dataset.author;


          document
            .querySelectorAll(
              ".author-button"
            )
            .forEach(
              item => {

                item
                  .classList
                  .remove(
                    "selected"
                  );

              }
            );


          button
            .classList
            .add(
              "selected"
            );

        }
      );

    }
  );


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


    /* 画像以外 */

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {

      alert(
        "画像ファイルを選んでね"
      );

      imageInput.value =
        "";

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      loadEvent => {

        const originalImage =
          loadEvent.target.result;


        resizeImage(
          originalImage,
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


    reader.readAsDataURL(
      file
    );

  }
);


/* ========================================
   IMAGE RESIZE

   iPhone写真をそのまま
   localStorageへ入れると
   容量オーバーしやすいため圧縮
======================================== */

function resizeImage(
  source,
  callback
) {

  const image =
    new Image();


  image.onload =
    () => {

      const maxSize =
        1000;


      let width =
        image.width;

      let height =
        image.height;


      if (
        width >
        height
      ) {

        if (
          width >
          maxSize
        ) {

          height =
            Math.round(
              height *
              maxSize /
              width
            );

          width =
            maxSize;

        }

      } else {

        if (
          height >
          maxSize
        ) {

          width =
            Math.round(
              width *
              maxSize /
              height
            );

          height =
            maxSize;

        }

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
        canvas.getContext(
          "2d"
        );


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
          0.75
        );


      callback(
        compressed
      );

    };


  image.src =
    source;

}


/* ========================================
   ADD
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
      "🐹 ポケットに入れたよ！"
    );

  }
);


/* ========================================
   RESET ADD FORM
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
    .querySelectorAll(
      ".author-button"
    )
    .forEach(
      button => {

        button
          .classList
          .toggle(

            "selected",

            button.dataset.author ===
            "よしの"

          );

      }
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
    .add(
      "show"
    );


  toastTimer =
    setTimeout(
      () => {

        toast
          .classList
          .remove(
            "show"
          );

      },
      1800
    );

}


/* ========================================
   SETTINGS
   現段階では仮
======================================== */

function temporarySettings() {

  showToast(
    "⚙️ 設定画面は次に作るよ"
  );

}


document
  .getElementById(
    "settingsButton"
  )
  .addEventListener(
    "click",
    temporarySettings
  );


document
  .getElementById(
    "bottomSettings"
  )
  .addEventListener(
    "click",
    temporarySettings
  );


/* ========================================
   START
======================================== */

render();
