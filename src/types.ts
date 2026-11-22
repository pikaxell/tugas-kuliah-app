export type StatusTugas = "Belum Selesai" | "Selesai";

export interface TugasKuliah {
  id: number;
  mataKuliah: string;
  judulTugas: string;
  tenggat: string;
  status: StatusTugas;
  prioritasTinggi: boolean;
}

export class PenyimpananLokal<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  simpan(data: T): void {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  ambil(defaultValue: T): T {
    const tersimpan = localStorage.getItem(this.key);
    if (!tersimpan) return defaultValue;
    try {
      return JSON.parse(tersimpan) as T;
    } catch {
      return defaultValue;
    }
  }
}
