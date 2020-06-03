const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");

let initialColors;

generateBtn.addEventListener("click", randomColors);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    toggleAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    toggleAdjustmentPanel(index);
  });
});
lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    toggleLock(index);
  });
});

function generateHex() {
  const hexColor = chroma.random();

  return hexColor;
}

function randomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    const divIcon = div.querySelectorAll(".controls button");

    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    checkTextContrast(randomColor, hexText);
    for (icon of divIcon) {
      checkTextContrast(randomColor, icon);
    }

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];
    colorizeSliders(color, hue, brightness, saturation);
  });

  resetInputs();
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  hue.style.backgroundImage = `linear-gradient(to right, 
    rgb(204,75,75), 
    rgb(204,204,75), 
    rgb(75,204,75), 
    rgb(75,204,204), 
    rgb(75,75,204), 
    rgb(204,75,204), 
    rgb(204,75,75))`;
  brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-sat");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);
  colorDivs[index].style.backgroundColor = color;
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");

  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function toggleAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function toggleLock(index) {
  colorDivs[index].classList.toggle("locked");
  lockButton[index].children[0].classList.toggle("fa-lock");
  lockButton[index].children[0].classList.toggle("fa-lock-open");
}

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibrary = document.querySelector(".close-library");

saveBtn.addEventListener("click", () => {
  togglePalette();
  toggleLibrary();
});
closeSave.addEventListener("click", togglePalette);
submitSave.addEventListener("click", addPalette);
libraryBtn.addEventListener("click", () => {
  getDatabase();
  toggleLibrary();
});
closeLibrary.addEventListener("click", toggleLibrary);

function togglePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.toggle("active");
  popup.classList.toggle("active");
}

function toggleLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.toggle("active");
  popup.classList.toggle("active");
}

function getDatabase() {
  while (libraryContainer.children[0].childElementCount > 3) {
    libraryContainer.children[0].removeChild(
      libraryContainer.children[0].lastChild
    );
  }

  fetch("https://colors-server.herokuapp.com/")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((dbPalette) => {
        const palette = document.createElement("div");
        palette.classList.add("custom-palette");
        const title = document.createElement("h4");
        title.innerText = dbPalette.name;
        const preview = document.createElement("div");
        preview.classList.add("small-preview");
        dbPalette.colors.forEach((smallColor) => {
          const smallDiv = document.createElement("div");
          smallDiv.style.backgroundColor = smallColor;
          preview.appendChild(smallDiv);
        });
        const paletteBtn = document.createElement("button");
        paletteBtn.classList.add("pick-palette-btn");
        paletteBtn.classList.add(dbPalette.id);
        paletteBtn.innerText = "Select";

        const paletteUpdate = document.createElement("button");
        paletteUpdate.classList.add("update-palette-btn");
        paletteUpdate.classList.add(dbPalette.id);
        paletteUpdate.innerText = "Update";

        const paletteDelete = document.createElement("button");
        paletteDelete.classList.add("delete-palette-btn");
        paletteDelete.classList.add(dbPalette.id);
        paletteDelete.innerText = "Delete";

        paletteBtn.addEventListener("click", (e) => {
          toggleLibrary();
          initialColors = [];
          dbPalette.colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateTextUI(index);

            const sliderColor = chroma(color);
            const sliders = colorDivs[index].children[2];
            const hue = sliders.children[2];
            const brightness = sliders.children[4];
            const saturation = sliders.children[6];
            colorizeSliders(sliderColor, hue, brightness, saturation);
          });
          resetInputs();
        });

        paletteUpdate.addEventListener("click", (e) => {
          const paletteIndex = e.target.classList[1];
          const colors = initialColors;
          const name = dbPalette.name;
          updatePalette(paletteIndex, colors, name);
        });

        paletteDelete.addEventListener("click", (e) => {
          deletePalette(e.target.classList[1]);
        });

        palette.appendChild(title);
        palette.appendChild(preview);
        palette.appendChild(paletteBtn);
        palette.appendChild(paletteUpdate);
        palette.appendChild(paletteDelete);
        libraryContainer.children[0].appendChild(palette);
      });
    });
}

function addPalette(e) {
  togglePalette();

  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let paletteId = Math.floor(Math.random() * 100);
  fetch("https://colors-server.herokuapp.com/", {
    method: "get",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      const ids = data.map((val) => {
        return val.id;
      });
      while (ids.includes(paletteId)) {
        paletteId = Math.floor(Math.random() * 100);
      }
    })
    .then(
      fetch("https://colors-server.herokuapp.com/", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paletteId,
          colors: colors,
          name: name,
        }),
      })
    );

  saveInput.value = "";
}

function updatePalette(id, colors, name) {
  fetch("https://colors-server.herokuapp.com/palette", {
    method: "put",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id,
      colors: colors,
      name: name,
    }),
  });
  toggleLibrary();
}

function deletePalette(id) {
  fetch("https://colors-server.herokuapp.com/delete", {
    method: "delete",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id,
    }),
  });
  toggleLibrary();
}

getDatabase();
randomColors();
