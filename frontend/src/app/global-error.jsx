"use client";
import Link from "next/link";
export default function GlobalError({ error, reset }) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f4f0e9",
          color: "#181715",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "0.6875rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#c4715f",
            }}
          >
            Lỗi hệ thống
          </p>

          <h1
            style={{
              margin: "1.5rem 0 0",
              fontSize: "2.75rem",
              lineHeight: 1.08,
              fontWeight: 300,
              letterSpacing: "-0.02em",
              fontFamily: "ui-serif, Georgia, serif",
            }}
          >
            Không tải được trang.
          </h1>

          <p
            style={{
              margin: "1.75rem 0 0",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "rgba(24,23,21,0.6)",
            }}
          >
            Vui lòng thử lại. Nếu vẫn không được, gọi salon theo số 0901 000 888
            để đặt lịch trực tiếp.
          </p>

          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                cursor: "pointer",
                backgroundColor: "#181715",
                color: "#f4f0e9",
                padding: "1rem 1.5rem",
                fontSize: "0.6875rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Thử lại
            </button>
            <Link
              href="/"
              style={{
                fontSize: "0.6875rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(24,23,21,0.7)",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
              }}
            >
              Về trang chủ
            </Link>
          </div>

          {error.digest ? (
            <p
              style={{
                marginTop: "3rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid rgba(24,23,21,0.12)",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.75rem",
                color: "rgba(24,23,21,0.35)",
              }}
            >
              Mã lỗi: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
