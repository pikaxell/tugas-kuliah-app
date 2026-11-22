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

let idSedangDiedit: number | null = null;

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

  <section style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 0.9rem; color: #444;">
    <h3 style="margin-bottom: 10px; color: #222;">Penjelasan Teknis Pengembangan</h3>
    <ul style="padding-left: 20px; line-height: 1.6;">
      <li><strong>Git &amp; GitHub:</strong> Digunakan untuk melacak riwayat perubahan kode melalui commit, mengelola fitur pada branch terpisah, berkolaborasi melalui Pull Request, serta menyelesaikan merge conflict.</li>
      <li><strong>npm:</strong> Manajer paket untuk menginstal pustaka, mengatur skrip otomatisasi di <code>package.json</code>, serta mengelola <em>dependencies</em> dan <em>devDependencies</em> dengan aturan <em>semantic versioning</em>.</li>
      <li><strong>TypeScript:</strong> Memberikan pengecekan tipe data statis (<em>primitive types</em>, <em>interface</em>, <em>union type</em>, dan <em>generics</em>) untuk mencegah bug sebelum kode dijalankan di browser.</li>
      <li><strong>Vite &amp; Environment Variables:</strong> Build tool modern yang mempermudah proses development dan build. File <code>.env</code> (dengan awalan <code>VITE_</code>) dipakai untuk menyimpan konfigurasi non-rahasia seperti nama dan versi aplikasi tanpa mengekspos data sensitif ke GitHub.</li>
      <li><strong>Peran Compiler, Transpiler, dan Bundler:</strong> <em>Compiler/Transpiler</em> (seperti <code>tsc</code> dan <code>esbuild</code> di Vite) mengubah sintaks TypeScript menjadi JavaScript standar yang dipahami browser. <em>Bundler</em> (<code>Rollup</code> saat perintah <code>npm run build</code>) menggabungkan dan mengoptimalkan seluruh file JS, CSS, dan aset menjadi paket siap produksi.</li>
    </ul>
  </section>
`;

const form = document.querySelector<HTMLFormElement>("#task-form")!;
const formTitle = document.querySelector<HTMLElement>("#form-title")!;
const inputMatkul = document.querySelector<HTMLInputElement>("#matkul")!;
const inputTenggat = document.querySelector<HTMLInputElement>("#tenggat")!;
const inputJudul = document.querySelector<HTMLInputElement>("#judul")!;
const inputPrioritas = document.querySelector<HTMLInputElement>("#prioritas")!;
const btnSubmit = document.querySelector<HTMLButtonElement>("#btn-submit")!;
const btnCancel = document.querySelector<HTMLButtonElement>("#btn-cancel")!;
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

function resetForm(): void {
  idSedangDiedit = null;
  form.reset();
  formTitle.textContent = "Tambah Tugas Baru";
  btnSubmit.textContent = "Simpan";
  btnCancel.style.display = "none";
}

form.addEventListener("submit", (e: SubmitEvent) => {
  e.preventDefault();

  const mataKuliah: string = inputMatkul.value.trim();
  const tenggat: string = inputTenggat.value;
  const judulTugas: string = inputJudul.value.trim();
  const prioritasTinggi: boolean = inputPrioritas.checked;

  if (!mataKuliah || !tenggat || !judulTugas) return;

  if (idSedangDiedit !== null) {
    daftarTugas = daftarTugas.map((item) =>
      item.id === idSedangDiedit
        ? { ...item, mataKuliah, tenggat, judulTugas, prioritasTinggi }
        : item,
    );
  } else {
    const tugasBaru: TugasKuliah = {
      id: Date.now(),
      mataKuliah,
      judulTugas,
      tenggat,
      status: "Belum Selesai",
      prioritasTinggi,
    };
    daftarTugas = [tugasBaru, ...daftarTugas];
  }

  storage.simpan(daftarTugas);
  renderDaftarTugas();
  resetForm();
});

btnCancel.addEventListener("click", resetForm);

taskListEl.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const button = target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const id = Number(button.dataset.id);

  if (action === "toggle") {
    daftarTugas = daftarTugas.map((item) => {
      if (item.id === id) {
        const statusBaru: StatusTugas =
          item.status === "Belum Selesai" ? "Selesai" : "Belum Selesai";
        return { ...item, status: statusBaru };
      }
      return item;
    });
    storage.simpan(daftarTugas);
    renderDaftarTugas();
  } else if (action === "edit") {
    const tugasDitemukan = daftarTugas.find((item) => item.id === id);
    if (!tugasDitemukan) return;

    idSedangDiedit = tugasDitemukan.id;
    inputMatkul.value = tugasDitemukan.mataKuliah;
    inputTenggat.value = tugasDitemukan.tenggat;
    inputJudul.value = tugasDitemukan.judulTugas;
    inputPrioritas.checked = tugasDitemukan.prioritasTinggi;

    formTitle.textContent = "Edit Tugas";
    btnSubmit.textContent = "Update";
    btnCancel.style.display = "inline-block";
  } else if (action === "delete") {
    daftarTugas = daftarTugas.filter((item) => item.id !== id);
    if (idSedangDiedit === id) resetForm();
    storage.simpan(daftarTugas);
    renderDaftarTugas();
  }
});

renderDaftarTugas();
