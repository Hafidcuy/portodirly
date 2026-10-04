import { describe, expect, it } from "vitest";

import {
  errorAction,
  initialActionState,
  invalidAction,
  okAction,
  readValues,
} from "@/lib/action-state";

describe("ActionState helpers", () => {
  it("initialActionState dimulai dari idle", () => {
    expect(initialActionState).toEqual({ status: "idle" });
  });

  it("okAction menyimpan status sukses dan pesan", () => {
    expect(okAction("Tersimpan")).toEqual({ status: "success", message: "Tersimpan", values: undefined });
  });

  it("invalidAction menyimpan pesan per-field", () => {
    const state = invalidAction({ title_en: ["Wajib diisi"] }, { title_en: "" });
    expect(state.status).toBe("error");
    expect(state.fieldErrors?.title_en).toEqual(["Wajib diisi"]);
    expect(state.values).toEqual({ title_en: "" });
  });

  it("errorAction menyimpan pesan umum", () => {
    expect(errorAction("Gagal")).toEqual({ status: "error", message: "Gagal", values: undefined });
  });
});

describe("readValues", () => {
  it("mengumpulkan nilai string per kunci", () => {
    const data = new FormData();
    data.append("title_en", "Portofolio");
    data.append("title_id", "Portofolio ID");

    expect(readValues(data)).toEqual({ title_en: "Portofolio", title_id: "Portofolio ID" });
  });

  it("memilih nilai 'on'/'true' saat checkbox berpasangan dengan hidden input", () => {
    const data = new FormData();
    data.append("featured", "false");
    data.append("featured", "on");

    expect(readValues(data).featured).toBe("on");
  });

  it("mempertahankan 'false' ketika checkbox tidak dicentang", () => {
    const data = new FormData();
    data.append("featured", "false");

    expect(readValues(data).featured).toBe("false");
  });

  it("melewati sort_order kosong dan entri non-teks (file)", () => {
    const data = new FormData();
    data.append("sort_order", "");
    data.append("avatar", new File(["x"], "a.png", { type: "image/png" }));
    data.append("title", "Masih ada");

    expect(readValues(data)).toEqual({ title: "Masih ada" });
  });
});
