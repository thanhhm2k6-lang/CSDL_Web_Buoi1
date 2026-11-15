import test from "node:test";
import assert from "node:assert/strict";
import { api } from "../src/api.js";

test("1. GET thanh cong tra ve du lieu JSON", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ message: "success" }),
  });
  try {
    const res = await api("/test");
    assert.deepEqual(res, { message: "success" });
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("2. AbortError duoc giu nguyen khi request bi huy", async () => {
  const origFetch = globalThis.fetch;
  const abortErr = new Error("The operation was aborted");
  abortErr.name = "AbortError";
  globalThis.fetch = async () => {
    throw abortErr;
  };
  try {
    await assert.rejects(async () => {
      await api("/test");
    }, (err) => err.name === "AbortError");
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("3. Loi mang/CORS nem thong bao ro rang", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };
  try {
    await assert.rejects(async () => {
      await api("/test");
    }, /Không nhận được phản hồi API/);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("4. DELETE thanh cong status 204 tra ve null", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 204,
  });
  try {
    const res = await api("/test", { method: "DELETE" });
    assert.equal(res, null);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("5. Phan hoi khong phai JSON nem loi ro rang", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () => "<html>502 Bad Gateway</html>",
  });
  try {
    await assert.rejects(async () => {
      await api("/test");
    }, /phản hồi không phải JSON/);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("6. HTTP loi voi detail dang chuoi", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    text: async () => JSON.stringify({ detail: "Tham số không hợp lệ" }),
  });
  try {
    await assert.rejects(async () => {
      await api("/test");
    }, /HTTP 400: Tham số không hợp lệ/);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("7. HTTP loi 422 voi detail la danh sach item.msg", async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 422,
    text: async () =>
      JSON.stringify({
        detail: [{ msg: "field required" }, { msg: "invalid value" }],
      }),
  });
  try {
    await assert.rejects(async () => {
      await api("/test");
    }, /HTTP 422: field required; invalid value/);
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("8. POST kem body duoc JSON.stringify va co Content-Type", async () => {
  const origFetch = globalThis.fetch;
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return {
      ok: true,
      status: 201,
      text: async () => JSON.stringify({ id: 1 }),
    };
  };
  try {
    const payload = { student_id: "22000004", class_section_id: "WEB-01" };
    await api("/enrollments", { method: "POST", body: payload });
    assert.equal(captured.options.method, "POST");
    assert.equal(
      captured.options.headers["Content-Type"],
      "application/json",
    );
    assert.equal(captured.options.body, JSON.stringify(payload));
  } finally {
    globalThis.fetch = origFetch;
  }
});

