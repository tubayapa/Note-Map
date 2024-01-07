import { setStorage, getStorage, icons, userIcon } from "./helpers.js";

const form = document.querySelector("form");
const noteList = document.querySelector("ul");

var map;
var coords;
var notes = getStorage() || [];
var markerLayer = null;

// map on screen
function loadMap(coords) {
  map = L.map("map").setView(coords, 15);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  //   layer for icons
  markerLayer = L.layerGroup().addTo(map);

  // user loc with icons
  L.marker(coords, { icon: userIcon }).addTo(map);

  // data from storage
  renderNoteList(notes);

  // watch click on map
  map.on("click", onMapClick);
}

//* icansel button
form[3].addEventListener("click", () => {
  // formu temizle
  form.reset();

  // close form
  form.style.display = "none";
});

//* fcreating new note
form.addEventListener("submit", (e) => {
  e.preventDefault();

  //2) use input datas
  const newNote = {
    id: new Date().getTime(),
    title: form[0].value,
    date: form[1].value,
    status: form[2].value,
    coords: coords,
  };

  notes.unshift(newNote);

  //4) show notes
  renderNoteList(notes);

  //5)update storage
  setStorage(notes);

  //6) close form
  form.style.display = "none";
  form.reset();
});

// aad to new icon on map
function renderMarker(note) {
  // crate icon
  L.marker(note.coords, { icon: icons[note.status] })
    //add it to layer
    .addTo(markerLayer)
    .bindPopup(note.title);
}

//* shows notes
function renderNoteList(items) {
  // ö
  noteList.innerHTML = "";
  markerLayer.clearLayers();

  // show each icons for notes
  items.forEach((note) => {
    const listEle = document.createElement("li");

    listEle.dataset.id = note.id;

    listEle.innerHTML = `
            <div class="info">
              <p>${note.title}</p>
              <p>
                <span>Tarih:</span>
                <span>${note.date}</span>
              </p>
              <p>
                <span>Durum:</span>
                <span>${note.status}</span>
              </p>
            </div>
            <div class="icons">
              <i id="fly" class="bi bi-airplane-fill"></i>
              <i id="delete" class="bi bi-trash3-fill"></i>
            </div>    
     `;

    noteList.appendChild(listEle);

    renderMarker(note);
  });
}

navigator.geolocation.getCurrentPosition(
  (e) => {
    loadMap([e.coords.latitude, e.coords.longitude]);
  },

  () => {
    loadMap([39.953925, 32.858552]);
  }
);

function onMapClick(event) {
  coords = [event.latlng.lat, event.latlng.lng];

  form.style.display = "flex";

  form[0].focus();
}

noteList.addEventListener("click", (e) => {
  const found_id = e.target.closest("li").dataset.id;

  if (
    e.target.id === "delete" &&
    confirm("Are you sure you want to delete it?")
  ) {
    // delete note we know id

    notes = notes.filter((note) => note.id != found_id);

    setStorage(notes);

    renderNoteList(notes);
  }

  if (e.target.id === "fly") {
    const note = notes.find((note) => note.id == found_id);

    map.flyTo(note.coords);
  }
});

// toggle

const closeBtn = document.getElementById("closeBtn");
const listBtn = document.getElementById("listBtn");
const aside = document.querySelector("aside");

closeBtn.addEventListener("click", () => {
  closeBtn.style.display = "none";
  listBtn.style.display = "flex";
  aside.classList.add("hideaside");
});

listBtn.addEventListener("click", () => {
  listBtn.style.display = "none";
  closeBtn.style.display = "flex";
  aside.classList.remove("hideaside");
  aside.style.transition = "ease 1s "
});
