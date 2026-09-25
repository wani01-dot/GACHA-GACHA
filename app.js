/* =========================================
   ガチャポケット
========================================= */

const SUPABASE_URL =
  "https://fcsdalrtcahjzibrjaaa.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_knbi7zS6UuBY6dqSfy9rFg_QXfn0i-W";

const STORAGE_KEY =
  "gacha-pocket-main-v2";

const SETTINGS_KEY =
  "gacha-pocket-settings-v1";


/* =========================================
   SAMPLE
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
  sort: "new",
  filter: "all"
};


/* =========================================
   STORAGE
========================================= */

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


/* =========================================
   STATE
========================================= */

let gachas =
  loadData();

let settings =
  loadSettings();

let currentFilter =
  settings.filter || "all";

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

let toastTimer =
  null;


/* =========================================
   DOM
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

const settingsButton =
  document.getElementById("settingsButton");


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

const releaseYear =
  document.getElementById("releaseYear");

const releaseMonth =
  document.getElementById("releaseMonth");

const releaseUndecided =
  document.getElementById("releaseUndecided");

const releaseSelectArea =
  document.getElementById("releaseSelectArea");

const releasePreview =
  document.getElementById("releasePreview");


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
   SAVE STORAGE
========================================= */

function saveData() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(gachas)
    );

    return true;

  } catch (error) {

    console.error(error);

    alert(
      "保存できませんでした。画像の容量が大きすぎる可能性があります。"
    );

    return false;

  }

}


function saveSettings() {

  try {

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

  } catch {}

}


/* =========================================
   ESCAPE
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


/* =========================================
   RELEASE
========================================= */

function getReleaseInfo(item) {

  if (
    item.releaseStatus ===
    "undecided"
  ) {

    return {
      status: "undecided",
      year: "",
      month: ""
    };

  }


  if (
    item.releaseYear &&
    item.releaseMonth
  ) {

    return {
      status: "month",
      year:
        Number(item.releaseYear),
      month:
        Number(item.releaseMonth)
    };

  }


  if (item.releaseDate) {

    const parts =
      String(item.releaseDate)
        .split("-");


    if (
      parts.length >= 2
    ) {

      return {
        status: "month",
        year:
          Number(parts[0]),
        month:
          Number(parts[1])
      };

    }

  }


  return {
    status: "undecided",
    year: "",
    month: ""
  };

}


function formatRelease(item) {

  const info =
    getReleaseInfo(item);


  if (
    info.status ===
    "undecided"
  ) {

    return "発売日未定";

  }


  if (
    info.year &&
    info.month
  ) {

    return (
      info.year +
      "年" +
      info.month +
      "月頃発売"
    );

  }


  return "発売日未定";

}


function getReleaseSortValue(item) {

  const info =
    getReleaseInfo(item);


  if (
    info.status ===
    "undecided"
  ) {

    return 999999;

  }


  return (
    Number(info.year) * 100
    +
    Number(info.month)
  );

}


/* =========================================
   YEAR OPTIONS
========================================= */

function createYearOptions() {

  if (!releaseYear) {
    return;
  }


  const currentYear =
    new Date().getFullYear();


  releaseYear.innerHTML =
    `
      <option value="">
        年を選択
      </option>
    `;


  for (
    let year =
      currentYear - 1;

    year <=
      currentYear + 10;

    year++
  ) {

    const option =
      document.createElement(
        "option"
      );


    option.value =
      String(year);

    option.textContent =
      `${year}年`;


    releaseYear.appendChild(
      option
    );

  }

}


/* =========================================
   RELEASE UI
========================================= */

function updateReleaseUI() {

  const undecided =
    releaseUndecided &&
    releaseUndecided.checked;


  if (releaseSelectArea) {

    releaseSelectArea.classList.toggle(
      "disabled",
      undecided
    );

  }


  if (
    releaseYear &&
    releaseMonth
  ) {

    releaseYear.disabled =
      undecided;

    releaseMonth.disabled =
      undecided;

  }


  if (!releasePreview) {
    return;
  }


  if (undecided) {

    releasePreview.textContent =
      "発売日未定";

    return;

  }


  const year =
    releaseYear
      ? releaseYear.value
      : "";


  const month =
    releaseMonth
      ? releaseMonth.value
      : "";


  if (
    year &&
    month
  ) {

    releasePreview.textContent =
      `${year}年${Number(month)}月頃発売`;

  } else {

    releasePreview.textContent =
      "発売予定を選んでね";

  }

}


/* =========================================
   PLACEHOLDER
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
   CARD
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
            formatRelease(item)
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
   FILTER UI
========================================= */

function updateFilterUI() {

  document
    .querySelectorAll(
      ".filter-button"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.filter ===
          currentFilter
      );

    });

}


function setFilter(filter) {

  const validFilters = [
    "all",
    "よしの",
    "たけうち"
  ];


  currentFilter =
    validFilters.includes(filter)
      ? filter
      : "all";


  settings.filter =
    currentFilter;


  saveSettings();

  updateFilterUI();

  render();

}


/* =========================================
   RENDER
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
        item.author ===
          currentFilter;


      const searchText =
        [
          item.title,
          item.memo,
          item.author,
          formatRelease(item)
        ]
        .join(" ")
        .toLowerCase();


      return (
        authorMatch
        &&
        searchText.includes(
          keyword
        )
      );

    });


  result =
    [...result];


  const sortValue =
    sortSelect
      ? sortSelect.value
      : settings.sort;


  if (
    sortValue === "new"
  ) {

    result.sort(
      (a,b) =>
        Number(
          b.createdAt || 0
        )
        -
        Number(
          a.createdAt || 0
        )
    );

  }


  if (
    sortValue ===
    "release"
  ) {

    result.sort(
      (a,b) =>
        getReleaseSortValue(a)
        -
        getReleaseSortValue(b)
    );

  }


  if (
    sortValue ===
    "title"
  ) {

    result.sort(
      (a,b) =>
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
   VIEW MODE
========================================= */

function setViewMode(
  mode,
  save = true
) {

  viewMode =
    mode;


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

    settings.view =
      mode;

    saveSettings();

  }

}


/* =========================================
   SCREEN LOCK
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


function unlockBackground(
  restorePosition = true
) {

  const restoreY =
    savedScrollY;


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

  document.documentElement.style.overflow =
    "";


  if (restorePosition) {

    window.scrollTo(
      0,
      restoreY
    );

  }

}


function openScreen(screen) {

  if (!screen) {
    return;
  }


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

    requestAnimationFrame(
      () => {

        inner.scrollTop =
          0;

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
   AUTHOR
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
   IMAGE UI
========================================= */

function updateImageUI() {

  const hasImage =
    typeof currentImage ===
      "string"
    &&
    currentImage.length > 20;


  if (imagePlaceholder) {

    imagePlaceholder.hidden =
      hasImage;

    imagePlaceholder.style.display =
      hasImage
        ? "none"
        : "flex";

  }


  if (imageSelectedArea) {

    imageSelectedArea.hidden =
      !hasImage;

    imageSelectedArea.style.display =
      hasImage
        ? "block"
        : "none";

  }


  if (selectImageButton) {

    selectImageButton.hidden =
      hasImage;

    selectImageButton.style.display =
      hasImage
        ? "none"
        : "flex";

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
   IMAGE COMPRESSION
========================================= */

function compressImage(
  dataURL,
  callback
) {

  const image =
    new Image();


  image.onload =
    function () {

      const MAX_WIDTH =
        900;

      const MAX_HEIGHT =
        900;


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


      try {

        callback(
          canvas.toDataURL(
            "image/jpeg",
            .72
          )
        );

      } catch {

        callback(
          dataURL
        );

      }

    };


  image.onerror =
    () =>
      callback(dataURL);


  image.src =
    dataURL;

}


/* =========================================
   IMAGE SELECT
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

        this.value =
          "";

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function (event) {

          const source =
            event.target.result;


          currentImage =
            source;


          updateImageUI();


          compressImage(
            source,
            compressed => {

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
   REMOVE IMAGE
========================================= */

if (removeImageButton) {

  removeImageButton.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopPropagation();


      currentImage =
        "";


      if (imageInput) {

        imageInput.value =
          "";

      }


      updateImageUI();

    }
  );

}


/* =========================================
   RESET RELEASE
========================================= */

function resetReleaseInput() {

  if (releaseYear) {
    releaseYear.value = "";
  }

  if (releaseMonth) {
    releaseMonth.value = "";
  }

  if (releaseUndecided) {
    releaseUndecided.checked = false;
  }


  updateReleaseUI();

}


/* =========================================
   OPEN ADD
========================================= */

function openAddScreen() {

  editingId =
    null;


  if (addForm) {
    addForm.reset();
  }


  currentImage =
    "";


  setAuthor(
    settings.user ||
    "よしの"
  );


  resetReleaseInput();

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
   SAVE
========================================= */

if (addForm) {

  addForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const title =
        titleInput
          ? titleInput.value.trim()
          : "";


      if (!title) {

        titleInput?.focus();

        return;

      }


      const undecided =
        releaseUndecided
        &&
        releaseUndecided.checked;


      const year =
        releaseYear
          ? releaseYear.value
          : "";


      const month =
        releaseMonth
          ? releaseMonth.value
          : "";


      if (
        !undecided
        &&
        (
          !year ||
          !month
        )
      ) {

        alert(
          "発売予定の年と月を選ぶか、「発売日未定」を選んでね"
        );

        return;

      }


      let savedId;


      if (
        editingId !== null
      ) {

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

          releaseStatus:
            undecided
              ? "undecided"
              : "month",

          releaseYear:
            undecided
              ? ""
              : Number(year),

          releaseMonth:
            undecided
              ? ""
              : Number(month),

          releaseDate:
            "",

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


        gachas.unshift({

          id:
            savedId,

          title,

          releaseStatus:
            undecided
              ? "undecided"
              : "month",

          releaseYear:
            undecided
              ? ""
              : Number(year),

          releaseMonth:
            undecided
              ? ""
              : Number(month),

          releaseDate:
            "",

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

        });

      }


      const saved =
        saveData();


      if (!saved) {
        return;
      }


      const wasEditing =
        editingId !== null;


      render();


      closeScreen(
        addScreen,
        false
      );


      requestAnimationFrame(
        () => {

          requestAnimationFrame(
            () => {

              showDetail(
                savedId
              );


              showToast(
                wasEditing
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
   DETAIL
========================================= */

function showDetail(id) {

  const item =
    gachas.find(
      gacha =>
        String(gacha.id) ===
        String(id)
    );


  if (!item) {
    return;
  }


  detailId =
    item.id;


  const imageArea =
    document.getElementById(
      "detailImageArea"
    );


  if (imageArea) {

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
      formatRelease(item);

  }


  const detailRelease =
    document.getElementById(
      "detailRelease"
    );


  if (detailRelease) {

    const info =
      getReleaseInfo(item);


    detailRelease.textContent =
      info.status ===
        "undecided"
        ? "発売未定"
        : "発売予定";

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
   CARD CLICK
========================================= */

if (cards) {

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


      event.preventDefault();


      showDetail(
        card.dataset.id
      );

    }
  );


  cards.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Enter"
        &&
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
    () => {

      const item =
        gachas.find(
          gacha =>
            String(gacha.id) ===
            String(detailId)
        );


      if (
        !item ||
        !item.url
      ) {

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
   EDIT
========================================= */

const editButton =
  document.getElementById(
    "editButton"
  );


if (editButton) {

  editButton.addEventListener(
    "click",
    () => {

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


      const releaseInfo =
        getReleaseInfo(item);


      if (
        releaseInfo.status ===
        "undecided"
      ) {

        if (releaseUndecided) {
          releaseUndecided.checked =
            true;
        }

        if (releaseYear) {
          releaseYear.value =
            "";
        }

        if (releaseMonth) {
          releaseMonth.value =
            "";
        }

      } else {

        if (releaseUndecided) {
          releaseUndecided.checked =
            false;
        }

        if (releaseYear) {
          releaseYear.value =
            String(
              releaseInfo.year
            );
        }

        if (releaseMonth) {
          releaseMonth.value =
            String(
              releaseInfo.month
            );
        }

      }


      updateReleaseUI();

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
        () => {

          openScreen(
            addScreen
          );

        }
      );

    }
  );

}


/* =========================================
   DELETE
========================================= */

const deleteButton =
  document.getElementById(
    "deleteButton"
  );


if (deleteButton) {

  deleteButton.addEventListener(
    "click",
    () => {

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
   SETTINGS
========================================= */

function updateStats() {

  const total =
    document.getElementById(
      "totalCount"
    );

  const yoshino =
    document.getElementById(
      "yoshinoCount"
    );

  const takeuchi =
    document.getElementById(
      "takeuchiCount"
    );


  if (total) {

    total.textContent =
      gachas.length;

  }


  if (yoshino) {

    yoshino.textContent =
      gachas.filter(
        item =>
          item.author ===
          "よしの"
      ).length;

  }


  if (takeuchi) {

    takeuchi.textContent =
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


  const defaultView =
    document.getElementById(
      "defaultViewSelect"
    );


  if (defaultView) {

    defaultView.value =
      settings.view;

  }


  const defaultSort =
    document.getElementById(
      "defaultSortSelect"
    );


  if (defaultSort) {

    defaultSort.value =
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
   SETTINGS → HOME
========================================= */

function returnHomeFromSettings() {

  if (settingsScreen) {

    settingsScreen.classList.remove(
      "open"
    );

    settingsScreen.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  if (addScreen) {

    addScreen.classList.remove(
      "open"
    );

    addScreen.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  if (detailScreen) {

    detailScreen.classList.remove(
      "open"
    );

    detailScreen.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  unlockBackground(
    false
  );


  if (searchInput) {

    searchInput.value =
      "";

  }


  updateFilterUI();


  setViewMode(
    settings.view,
    false
  );


  if (sortSelect) {

    sortSelect.value =
      settings.sort;

  }


  render();


  requestAnimationFrame(
    () => {

      window.scrollTo(
        0,
        0
      );

    }
  );

}


/* =========================================
   MAIN EVENTS
========================================= */

if (addButton) {

  addButton.addEventListener(
    "click",
    openAddScreen
  );

}


if (settingsButton) {

  settingsButton.addEventListener(
    "click",
    openSettings
  );

}


if (photoButton) {

  photoButton.addEventListener(
    "click",
    () =>
      setViewMode(
        "photo"
      )
  );

}


if (listButton) {

  listButton.addEventListener(
    "click",
    () =>
      setViewMode(
        "list"
      )
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
    () => {

      settings.sort =
        sortSelect.value;

      saveSettings();

      render();

    }
  );

}


/* =========================================
   RELEASE EVENTS
========================================= */

if (releaseYear) {

  releaseYear.addEventListener(
    "change",
    updateReleaseUI
  );

}


if (releaseMonth) {

  releaseMonth.addEventListener(
    "change",
    updateReleaseUI
  );

}


if (releaseUndecided) {

  releaseUndecided.addEventListener(
    "change",
    updateReleaseUI
  );

}


/* =========================================
   AUTHOR BUTTONS
========================================= */

document
  .querySelectorAll(
    ".author-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setAuthor(
          button.dataset.author
        );

      }
    );

  });


/* =========================================
   FILTER BUTTONS
========================================= */

document
  .querySelectorAll(
    ".filter-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setFilter(
          button.dataset.filter
        );

      }
    );

  });


/* =========================================
   SETTINGS USER
========================================= */

document
  .querySelectorAll(
    ".settings-user-button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        settings.user =
          button.dataset.user;

        currentAuthor =
          settings.user;

        saveSettings();

        updateSettingsUI();

      }
    );

  });


/* =========================================
   SETTINGS SELECTS
========================================= */

const defaultViewSelect =
  document.getElementById(
    "defaultViewSelect"
  );


if (defaultViewSelect) {

  defaultViewSelect.addEventListener(
    "change",
    () => {

      settings.view =
        defaultViewSelect.value;

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
    () => {

      settings.sort =
        defaultSortSelect.value;

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
   DELETE ALL
========================================= */

const deleteAllButton =
  document.getElementById(
    "deleteAllButton"
  );


if (deleteAllButton) {

  deleteAllButton.addEventListener(
    "click",
    () => {

      const ok =
        confirm(
          "登録しているガチャをすべて削除する？この操作は元に戻せません。"
        );


      if (!ok) {
        return;
      }


      gachas =
        [];


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
   CLOSE
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
    () =>
      closeScreen(
        screen
      )
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


/* =========================================
   SETTINGS HOME BUTTON
========================================= */

const closeSettingsButton =
  document.getElementById(
    "closeSettingsButton"
  );


if (closeSettingsButton) {

  closeSettingsButton.addEventListener(
    "click",
    event => {

      event.preventDefault();

      event.stopPropagation();

      returnHomeFromSettings();

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
      () => {

        toast.classList.remove(
          "show"
        );

      },
      1800
    );

}


/* =========================================
   START
========================================= */

createYearOptions();


const validStartFilters = [
  "all",
  "よしの",
  "たけうち"
];


if (
  !validStartFilters.includes(
    currentFilter
  )
) {

  currentFilter =
    "all";

  settings.filter =
    "all";

  saveSettings();

}


if (sortSelect) {

  sortSelect.value =
    settings.sort;

}


setViewMode(
  settings.view,
  false
);


updateFilterUI();

updateReleaseUI();

updateImageUI();

updateSettingsUI();

render();
