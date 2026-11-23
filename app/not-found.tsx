import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "48px 16px" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "12px" }}>Halaman Tidak Ditemukan 🔍</h2>
      <p style={{ marginBottom: "24px", color: "#556c86" }}>Wah, pulau atau halaman yang kamu cari belum ada.</p>
      <Link href="/menu" className="btn btn-navy">
        Kembali ke Peta Pulau 🏠
      </Link>
    </div>
  );
}

