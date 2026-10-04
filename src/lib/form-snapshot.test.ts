import { describe, expect, it } from "vitest";

import { captureFormSnapshot } from "@/lib/form-snapshot";

describe("captureFormSnapshot", () => {
  it("menyimpan nilai string sesuai urutan, file dilewati", () => {
    const data = new FormData();
    data.append("name", "Dirly");
    data.append("message", "Halo");
    data.append("cv", new File(["x"], "cv.pdf", { type: "application/pdf" }));

    expect(captureFormSnapshot(data)).toEqual([
      ["name", "Dirly"],
      ["message", "Halo"],
    ]);
  });

  it("menyimpan semua nilai berulang (checkbox pair)", () => {
    const data = new FormData();
    data.append("featured", "false");
    data.append("featured", "on");

    expect(captureFormSnapshot(data)).toEqual([
      ["featured", "false"],
      ["featured", "on"],
    ]);
  });

  it("menghasilkan snapshot kosong untuk FormData kosong", () => {
    expect(captureFormSnapshot(new FormData())).toEqual([]);
  });
});
