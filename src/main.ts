import "./style.css";
import { type TugasKuliah, type StatusTugas, PenyimpananLokal } from "./types";

const APP_NAME: string =
  import.meta.env.VITE_APP_NAME || "Pengelola Tugas Kuliah";
const APP_VERSION: string = import.meta.env.VITE_APP_VERSION || "1.0.0";

const storage = new PenyimpananLokal<TugasKuliah[]>("daftar_tugas_kuliah_v1");

let daftarTugas: TugasKuliah[] = storage.ambil([
  {
    id: 1,
    mataKuliah: "Pengembangan Aplikasi Web",
    judulTugas: "Membuat aplikasi web dengan TypeScript dan Vite",
    tenggat: "2026-11-30",
    status: "Belum Selesai",
    prioritasTinggi: true,
  },
]);

const appContainer = document.querySelector<HTMLDivElement>("#app")!;
appContainer.innerHTML = `
  <header>
    <h1>${APP_NAME}</h1>
    <small>v${APP_VERSION}</small>
  </header>

  <form id="task-form">
    <strong id="form-title">Tambah Tugas Baru</strong>
    <div class="row">
      <div>
        <label for="matkul">Mata Kuliah</label>
        <input type="text" id="matkul" required />
      </div>
      <div>
        <label for="tenggat">Tenggat</label>
        <input type="date" id="tenggat" required />
      </div>
    </div>
    <div>
      <label for="judul">Judul Tugas</label>
      <input type="text" id="judul" required />
    </div>
    <div>
      <label>
        <input type="checkbox" id="prioritas" /> Prioritas Tinggi
      </label>
    </div>
    <div>
      <button type="submit" id="btn-submit">Simpan</button>
      <button type="button" id="btn-cancel" style="display: none;">Batal</button>
    </div>
  </form>

  <div>
    <h3>Daftar Tugas (<span id="task-count">0</span>)</h3>
    <div id="task-list"></div>
  </div>
`;

const form = document.querySelector<HTMLFormElement>("#task-form")!;
const inputMatkul = document.querySelector<HTMLInputElement>("#matkul")!;
const inputTenggat = document.querySelector<HTMLInputElement>("#tenggat")!;
const inputJudul = document.querySelector<HTMLInputElement>("#judul")!;
const inputPrioritas = document.querySelector<HTMLInputElement>("#prioritas")!;
const taskListEl = document.querySelector<HTMLDivElement>("#task-list")!;
const taskCountEl = document.querySelector<HTMLSpanElement>("#task-count")!;

function renderDaftarTugas(): void {
  taskCountEl.textContent = daftarTugas.length.toString();

  if (daftarTugas.length === 0) {
    taskListEl.innerHTML = `<p style="color: #777;">Belum ada tugas.</p>`;
    return;
  }

  taskListEl.innerHTML = daftarTugas
    .map((tugas: TugasKuliah) => {
      const isSelesai: boolean = tugas.status === "Selesai";
      return `
        <div class="task-item ${isSelesai ? "selesai" : ""}">
          <div>
            <div class="task-meta">
              ${tugas.mataKuliah} • Tenggat: ${tugas.tenggat} • <strong>${tugas.status}</strong>
              ${tugas.prioritasTinggi ? " • [Prioritas]" : ""}
            </div>
            <div class="task-title"><strong>${tugas.judulTugas}</strong></div>
          </div>
          <div class="actions">
            <button data-action="toggle" data-id="${tugas.id}">
              ${isSelesai ? "Batal Selesai" : "Selesai"}
            </button>
            <button data-action="edit" data-id="${tugas.id}">Edit</button>
            <button data-action="delete" data-id="${tugas.id}">Hapus</button>
          </div>
        </div>
      `;
    })
    .join("");
}

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();
  const tugasBaru: TugasKuliah = {
    id: Date.now(),
    mataKuliah: inputMatkul.value.trim(),
    judulTugas: inputJudul.value.trim(),
    tenggat: inputTenggat.value,
    status: "Belum Selesai",
    prioritasTinggi: inputPrioritas.checked,
  };
  daftarTugas = [tugasBaru, ...daftarTugas];
  storage.simpan(daftarTugas);
  renderDaftarTugas();
  form.reset();
});

renderDaftarTugas();
