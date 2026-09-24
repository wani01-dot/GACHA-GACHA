const STORAGE_KEY =
  "gacha-pocket-main-v2";

const SETTINGS_KEY =
  "gacha-pocket-settings-v1";


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


const defaultSettings = {
  user: "よしの",
  view: "photo",
  sort: "new"
};


let gachas =
  loadData();

let settings =
  loadSettings();

let currentFilter =
  "all";

let currentAuthor =
  settings.user;

let currentImage =
  "";

let viewMode =
  settings.view;

let editingId =
  null;

let detailId =
  null;

let savedScrollY =
  0;


/* ELEMENTS */

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


/* STORAGE */

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

    return Array.isArray(parsed)
      ? parsed
      : [...sampleData];

  } catch {

    return [...sampleData];

  }

}


function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(gachas)
    );

  } catch {

    alert(
      "保存できませんでした。画像が大きすぎる可能性があります。"
    );

  }

}


function loadSettings() {

  try {

    const saved =
      localStorage.getItem(
        SETTINGS_KEY
      );

    if (!saved) {
      return {...defaultSettings};
    }

    return {
      ...defaultSettings,
      ...JSON.parse(saved)
    };

  } catch {

    return {...defaultSettings};

  }

}


function saveSettings() {

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(settings)
  );

}


/* HELPERS */

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


/* RENDER */

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
            escapeHTML(item.memo)
            ||
            "メモなし"
          }
        </div>

      </div>

    </article>
  `;

}


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


      const text =
        [
          item.title,
          item.memo,
          item.author
        ]
        .join(" ")
        .toLowerCase();


      return (
        authorMatch &&
        text.includes(keyword)
      );

    });


  result =
    [...result];


  if (
    sortSelect.value ===
    "new"
  ) {

    result.sort(
      (a,b) =>
        (b.createdAt || 0)
        -
        (a.createdAt || 0)
    );

  }


  if (
    sortSelect.value ===
    "release"
  ) {

    result.sort(
      (a,b) =>
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
      (a,b) =>
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


  cards.classList.toggle(
    "list-mode",
    viewMode === "list"
  );

}


/* VIEW */

function setViewMode(
  mode,
  save = true
) {

  viewMode =
    mode;


  photoButton.classList.toggle(
    "active",
    mode === "photo"
  );

  listButton.classList.toggle(
    "active",
    mode === "list"
  );


  cards.classList.toggle(
    "list-mode",
    mode === "list"
  );


  if (save) {

    settings.view =
      mode;

    saveSettings();

  }

}


photoButton.onclick =
  () => setViewMode("photo");


listButton.onclick =
  () => setViewMode("list");


searchInput.oninput =
  render;


sortSelect.onchange =
  () => {

    settings.sort =
      sortSelect.value;

    saveSettings();

    render();

  };


/* FILTER */

document
  .querySelectorAll(
    ".filter-button"
  )
  .forEach(button => {

    button.onclick =
      () => {

        currentFilter =
          button.dataset.filter;


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

      };

  });


/* SCREEN LOCK */

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


  window.scrollTo(
    0,
    savedScrollY
  );

}


function openScreen(screen) {

  lockBackground();

  screen.classList.add(
    "open"
  );

  screen.setAttribute(
    "aria-hidden",
    "false"
  );


  const inner =
    screen.querySelector(
      ".form-screen"
    );

  if (inner) {
    inner.scrollTop = 0;
  }

}


function closeScreen(screen) {

  screen.classList.remove(
    "open"
  );

  screen.setAttribute(
    "aria-hidden",
    "true"
  );


  const anyOpen =
    document.querySelector(
      ".screen-overlay.open"
    );


  if (!anyOpen) {
    unlockBackground();
  }

}


/* IMAGE STATE */

function updateImageUI() {

  const hasImage =
    Boolean(currentImage);


  imagePlaceholder.hidden =
    hasImage;


  imageSelectedArea.hidden =
    !hasImage;


  selectImageButton.hidden =
    hasImage;


  if (hasImage) {

    imagePreview.src =
      currentImage;

  } else {

    imagePreview.removeAttribute(
      "src"
    );

  }

}


/* ADD */

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


function openAddScreen() {

  editingId =
    null;


  addForm.reset();


  currentImage =
    "";


  setAuthor(
    settings.user
  );


  updateImageUI();


  formScreenTitle.textContent =
    "ガチャを追加";


  formScreenSubtitle.textContent =
    "ポケットに入れておこう";


  saveButton.lastChild.textContent =
    " ポケットに入れる";


  openScreen(
    addScreen
  );

}


addButton.onclick =
  openAddScreen;


document
  .querySelectorAll(
    ".author-button"
  )
  .forEach(button => {

    button.onclick =
      () =>
        setAuthor(
          button.dataset.author
        );

  });


/* IMAGE SELECT */

imageInput.onchange =
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

      return;

    }


    const reader =
      new FileReader();


    reader.onload =
      loadEvent => {

        resizeImage(
          loadEvent.target.result,
          result => {

            currentImage =
              result;

            updateImageUI();

          }
        );

      };


    reader.readAsDataURL(
      file
    );

  };


removeImageButton.onclick =
  () => {

    currentImage =
      "";

    imageInput.value =
      "";

    updateImageUI();

  };


function resizeImage(
  source,
  callback
) {

  const image =
    new Image();


  image.onload =
    () => {

      const maxSize =
        900;


      const ratio =
        Math.min(
          1,
          maxSize / image.width,
          maxSize / image.height
        );


      const width =
        Math.round(
          image.width * ratio
        );


      const height =
        Math.round(
          image.height * ratio
        );


      const canvas =
        document.createElement(
          "canvas"
        );


      canvas.width =
        width;

      canvas.height =
        height;


      canvas
        .getContext("2d")
        .drawImage(
          image,
          0,
          0,
          width,
          height
        );


      callback(
        canvas.toDataURL(
          "image/jpeg",
          .72
        )
      );

    };


  image.src =
    source;

}


/* SAVE ADD / EDIT */

addForm.onsubmit =
  event => {

    event.preventDefault();


    const title =
      titleInput.value.trim();


    if (!title) {

      titleInput.focus();

      return;

    }


    if (editingId) {

      const index =
        gachas.findIndex(
          item =>
            item.id ===
            editingId
        );


      if (index !== -1) {

        gachas[index] = {
          ...gachas[index],

          title,

          releaseDate:
            releaseInput.value,

          image:
            currentImage,

          url:
            urlInput.value.trim(),

          memo:
            memoInput.value.trim(),

          author:
            currentAuthor
        };

      }

    } else {

      gachas.unshift({

        id:
          Date.now(),

        title,

        releaseDate:
          releaseInput.value,

        image:
          currentImage,

        url:
          urlInput.value.trim(),

        memo:
          memoInput.value.trim(),

        author:
          currentAuthor,

        createdAt:
          Date.now()

      });

    }


    saveData();

    render();


    const savedId =
      editingId ||
      gachas[0].id;


    closeScreen(
      addScreen
    );


    showDetail(
      savedId
    );

  };


/* DETAIL */

function showDetail(id) {

  const item =
    gachas.find(
      gacha =>
        gacha.id === id
    );


  if (!item) {
    return;
  }


  detailId =
    id;


  const imageArea =
    document.getElementById(
      "detailImageArea"
    );


  imageArea.innerHTML =
    item.image

      ? `
        <img
          class="detail-image"
          src="${item.image}"
          alt=""
        >
      `

      : placeholderHTML(true);


  const detailAuthor =
    document.getElementById(
      "detailAuthor"
    );


  detailAuthor.textContent =
    `by ${item.author}`;


  detailAuthor.className =
    "detail-author " +
    (
      item.author === "よしの"
        ? "by-yoshino"
        : "by-takeuchi"
    );


  document.getElementById(
    "detailTitle"
  ).textContent =
    item.title;


  document.getElementById(
    "detailDate"
  ).textContent =
    formatDate(
      item.releaseDate
    );


  document.getElementById(
    "detailRelease"
  ).textContent =
    item.releaseDate
      ? "発売予定"
      : "発売日未定";


  document.getElementById(
    "detailMemo"
  ).textContent =
    item.memo ||
    "メモなし";


  document.getElementById(
    "detailUrlText"
  ).textContent =
    item.url ||
    "URL未登録";


  document.getElementById(
    "openUrlButton"
  ).disabled =
    !item.url;


  openScreen(
    detailScreen
  );

}


cards.onclick =
  event => {

    const card =
      event.target.closest(
        ".gacha-card"
      );


    if (!card) {
      return;
    }


    showDetail(
      Number(
        card.dataset.id
      )
    );

  };


document.getElementById(
  "openUrlButton"
).onclick =
  () => {

    const item =
      gachas.find(
        gacha =>
          gacha.id ===
          detailId
      );


    if (
      !item ||
      !item.url
    ) {
      return;
    }


    window.open(
      item.url,
      "_blank",
      "noopener,noreferrer"
    );

  };


/* EDIT */

document.getElementById(
  "editButton"
).onclick =
  () => {

    const item =
      gachas.find(
        gacha =>
          gacha.id ===
          detailId
      );


    if (!item) {
      return;
    }


    closeScreen(
      detailScreen
    );


    editingId =
      item.id;


    titleInput.value =
      item.title || "";


    releaseInput.value =
      item.releaseDate || "";


    urlInput.value =
      item.url || "";


    memoInput.value =
      item.memo || "";


    currentImage =
      item.image || "";


    setAuthor(
      item.author
    );


    updateImageUI();


    formScreenTitle.textContent =
      "ガチャを編集";


    formScreenSubtitle.textContent =
      "ポケットの中身を更新";


    saveButton.lastChild.textContent =
      " 変更を保存";


    openScreen(
      addScreen
    );

  };


/* DELETE */

document.getElementById(
  "deleteButton"
).onclick =
  () => {

    const item =
      gachas.find(
        gacha =>
          gacha.id ===
          detailId
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
          gacha.id !==
          detailId
      );


    saveData();

    render();

    closeScreen(
      detailScreen
    );


    showToast(
      "ガチャを削除したよ"
    );

  };


/* SETTINGS */

function updateStats() {

  document.getElementById(
    "totalCount"
  ).textContent =
    gachas.length;


  document.getElementById(
    "yoshinoCount"
  ).textContent =
    gachas.filter(
      item =>
        item.author ===
        "よしの"
    ).length;


  document.getElementById(
    "takeuchiCount"
  ).textContent =
    gachas.filter(
      item =>
        item.author ===
        "たけうち"
    ).length;

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


  document.getElementById(
    "defaultViewSelect"
  ).value =
    settings.view;


  document.getElementById(
    "defaultSortSelect"
  ).value =
    settings.sort;


  updateStats();

}


function openSettings() {

  updateSettingsUI();

  openScreen(
    settingsScreen
  );

}


document.getElementById(
  "settingsButton"
).onclick =
  openSettings;


document.getElementById(
  "bottomSettings"
).onclick =
  openSettings;


document
  .querySelectorAll(
    ".settings-user-button"
  )
  .forEach(button => {

    button.onclick =
      () => {

        settings.user =
          button.dataset.user;

        saveSettings();

        updateSettingsUI();

      };

  });


document.getElementById(
  "defaultViewSelect"
).onchange =
  event => {

    settings.view =
      event.target.value;

    saveSettings();

    setViewMode(
      settings.view,
      false
    );

  };


document.getElementById(
  "defaultSortSelect"
).onchange =
  event => {

    settings.sort =
      event.target.value;

    saveSettings();

    sortSelect.value =
      settings.sort;

    render();

  };


document.getElementById(
  "deleteAllButton"
).onclick =
  () => {

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

  };


/* CLOSE BUTTONS */

document.getElementById(
  "closeAddButton"
).onclick =
  () =>
    closeScreen(
      addScreen
    );


document.getElementById(
  "cancelAddButton"
).onclick =
  () =>
    closeScreen(
      addScreen
    );


document.getElementById(
  "closeDetailButton"
).onclick =
  () =>
    closeScreen(
      detailScreen
    );


document.getElementById(
  "closeSettingsButton"
).onclick =
  () =>
    closeScreen(
      settingsScreen
    );


/* BOTTOM */

document.getElementById(
  "homeButton"
).onclick =
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

  };


document.getElementById(
  "allGachaButton"
).onclick =
  () => {

    currentFilter =
      "all";

    searchInput.value =
      "";

    render();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


/* TOAST */

let toastTimer;


function showToast(message) {

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
      () => {

        toast.classList.remove(
          "show"
        );

      },
      1800
    );

}


/* START */

sortSelect.value =
  settings.sort;


setViewMode(
  settings.view,
  false
);


render();
