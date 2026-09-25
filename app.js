/* =========================================
   ガチャポケット
   SUPABASE SHARED VERSION
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
  "https://fcsdalrtcahjzibrjaaa.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_knbi7zS6UuBY6dqSfy9rFg_QXfn0i-W";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


const GACHA_TABLE =
  "gachas";

const IMAGE_BUCKET =
  "gacha-images";


/* =========================================
   LOCAL SETTINGS
========================================= */

const SETTINGS_KEY =
  "gacha-pocket-settings-v1";


const defaultSettings = {
  user: "よしの",
  view: "photo",
  sort: "new",
  filter: "all"
};


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

  } catch {}

}


/* =========================================
   STATE
========================================= */

let gachas = [];

let settings =
  loadSettings();

let currentFilter =
  settings.filter || "all";

let currentAuthor =
  settings.user;

let currentImage = "";

let currentImageFile = null;

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

let isSaving =
  false;


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
   DATABASE → APP FORMAT
========================================= */

function databaseToGacha(row) {

  return {

    id:
      row.id,

    title:
      row.title || "",

    releaseStatus:
      row.release_status ||
      "undecided",

    releaseYear:
      row.release_year || "",

    releaseMonth:
      row.release_month || "",

    releaseDate:
      "",

    image:
      row.image_url || "",

    url:
      row.source_url || "",

    memo:
      row.memo || "",

    author:
      row.author || "よしの",

    createdAt:
      Number(row.created_at || 0)

  };

}


/* =========================================
   LOAD FROM SUPABASE
========================================= */

async function loadGachasFromSupabase() {

  if (cards) {

    cards.innerHTML =
      `
        <div
          style="
            grid-column:1/-1;
            text-align:center;
            padding:40px 20px;
            opacity:.65;
          "
        >
          ポケットを確認中...
        </div>
      `;

  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from(GACHA_TABLE)
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "Supabase load error:",
      error
    );


    if (cards) {

      cards.innerHTML = "";

    }


    if (empty) {

      empty.hidden = false;

      const strong =
        empty.querySelector(
          "strong"
        );

      const paragraph =
        empty.querySelector(
          "p"
        );


      if (strong) {

        strong.textContent =
          "読み込めなかったよ";

      }


      if (paragraph) {

        paragraph.innerHTML =
          "Supabaseとの接続を<br>確認してね";

      }

    }


    showToast(
      "データを読み込めませんでした"
    );

    return false;

  }


  gachas =
    (data || [])
      .map(databaseToGacha);


  render();

  updateStats();

  return true;

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
          src="${escapeHTML(item.image)}"
          alt=""
          loading="lazy"
        >
      `

      : placeholderHTML();


  return `
    <article
      class="gacha-card"
      data-id="${escapeHTML(item.id)}"
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
    currentImage.length > 0;


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
        1200;

      const MAX_HEIGHT =
        1200;


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
            .78
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
   DATA URL → BLOB
========================================= */

function dataURLToBlob(dataURL) {

  const parts =
    dataURL.split(",");


  const mimeMatch =
    parts[0].match(
      /data:(.*?);base64/
    );


  const mime =
    mimeMatch
      ? mimeMatch[1]
      : "image/jpeg";


  const binary =
    atob(parts[1]);


  const bytes =
    new Uint8Array(
      binary.length
    );


  for (
    let i = 0;
    i < binary.length;
    i++
  ) {

    bytes[i] =
      binary.charCodeAt(i);

  }


  return new Blob(
    [bytes],
    {
      type: mime
    }
  );

}


/* =========================================
   UPLOAD IMAGE TO SUPABASE
========================================= */

async function uploadImageIfNeeded() {

  if (!currentImage) {
    return "";
  }


  if (
    currentImage.startsWith(
      "http://"
    )
    ||
    currentImage.startsWith(
      "https://"
    )
  ) {

    return currentImage;

  }


  if (
    !currentImage.startsWith(
      "data:"
    )
  ) {

    return "";

  }


  try {

    const blob =
      dataURLToBlob(
        currentImage
      );


    const filename =
      `gacha-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.jpg`;


    const {
      error
    } =
      await supabaseClient
        .storage
        .from(IMAGE_BUCKET)
        .upload(
          filename,
          blob,
          {
            contentType:
              "image/jpeg",

            cacheControl:
              "3600",

            upsert:
              false
          }
        );


    if (error) {

      console.error(
        "Image upload error:",
        error
      );

      throw error;

    }


    const {
      data
    } =
      supabaseClient
        .storage
        .from(IMAGE_BUCKET)
        .getPublicUrl(
          filename
        );


    return (
      data?.publicUrl ||
      ""
    );

  } catch (error) {

    console.error(error);

    throw new Error(
      "画像をアップロードできませんでした"
    );

  }

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

        this.value = "";

        return;

      }


      currentImageFile =
        file;


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


      currentImage = "";

      currentImageFile = null;


      if (imageInput) {

        imageInput.value = "";

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

  editingId = null;


  if (addForm) {
    addForm.reset();
  }


  currentImage = "";

  currentImageFile = null;


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

    saveButton.disabled =
      false;

  }


  openScreen(
    addScreen
  );

}


/* =========================================
   SAVE TO SUPABASE
========================================= */

if (addForm) {

  addForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      if (isSaving) {
        return;
      }


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


      isSaving = true;


      if (saveButton) {

        saveButton.disabled =
          true;

        saveButton.textContent =
          "保存中...";

      }


      try {

        const imageUrl =
          await uploadImageIfNeeded();


        const row = {

          title,

          release_status:
            undecided
              ? "undecided"
              : "month",

          release_year:
            undecided
              ? null
              : Number(year),

          release_month:
            undecided
              ? null
              : Number(month),

          image_url:
            imageUrl || "",

          source_url:
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


        let savedId = null;

        const wasEditing =
          editingId !== null;


        if (wasEditing) {

          const {
            data,
            error
          } =
            await supabaseClient
              .from(GACHA_TABLE)
              .update(row)
              .eq(
                "id",
                editingId
              )
              .select()
              .single();


          if (error) {
            throw error;
          }


          savedId =
            data.id;

        } else {

          row.created_at =
            Date.now();


          const {
            data,
            error
          } =
            await supabaseClient
              .from(GACHA_TABLE)
              .insert(row)
              .select()
              .single();


          if (error) {
            throw error;
          }


          savedId =
            data.id;

        }


        await loadGachasFromSupabase();


        closeScreen(
          addScreen,
          false
        );


        editingId =
          null;


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

              }
            );

          }
        );

      } catch (error) {

        console.error(
          "Save error:",
          error
        );


        alert(
          "保存できませんでした。\n\n" +
          (
            error?.message ||
            "Supabaseとの接続を確認してね"
          )
        );

      } finally {

        isSaving = false;


        if (saveButton) {

          saveButton.disabled =
            false;


          saveButton.innerHTML =
            editingId !== null
              ? `
                  <span class="mini-capsule"></span>
                  変更を保存
                `
              : `
                  <span class="mini-capsule"></span>
                  ポケットに入れる
                `;

        }

      }

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
            src="${escapeHTML(item.image)}"
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

      currentImageFile =
        null;


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
          releaseYear.value = "";
        }

        if (releaseMonth) {
          releaseMonth.value = "";
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
   DELETE FROM SUPABASE
========================================= */

const deleteButton =
  document.getElementById(
    "deleteButton"
  );


if (deleteButton) {

  deleteButton.addEventListener(
    "click",
    async () => {

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


      const {
        error
      } =
        await supabaseClient
          .from(GACHA_TABLE)
          .delete()
          .eq(
            "id",
            detailId
          );


      if (error) {

        console.error(
          "Delete error:",
          error
        );

        alert(
          "削除できませんでした。\n" +
          error.message
        );

        return;

      }


      closeScreen(
        detailScreen
      );


      detailId = null;


      await loadGachasFromSupabase();


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

    searchInput.value = "";

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
   DELETE ALL FROM SUPABASE
========================================= */

const deleteAllButton =
  document.getElementById(
    "deleteAllButton"
  );


if (deleteAllButton) {

  deleteAllButton.addEventListener(
    "click",
    async () => {

      const ok =
        confirm(
          "登録しているガチャをすべて削除する？この操作は元に戻せません。"
        );


      if (!ok) {
        return;
      }


      /*
        created_at は登録時に必ず0以上になるので
        全レコードを対象にする。
      */

      const {
        error
      } =
        await supabaseClient
          .from(GACHA_TABLE)
          .delete()
          .gte(
            "created_at",
            0
          );


      if (error) {

        console.error(
          "Delete all error:",
          error
        );

        alert(
          "削除できませんでした。\n" +
          error.message
        );

        return;

      }


      await loadGachasFromSupabase();


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
   REALTIME
========================================= */

function startRealtime() {

  supabaseClient
    .channel(
      "gacha-pocket-realtime"
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: GACHA_TABLE
      },
      async () => {

        await loadGachasFromSupabase();

      }
    )
    .subscribe();

}


/* =========================================
   START
========================================= */

async function startApp() {

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


  await loadGachasFromSupabase();


  startRealtime();

}


startApp();
