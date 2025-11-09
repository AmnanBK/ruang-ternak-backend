# Backend API - Ruang Ternak

Ini adalah repositori resmi untuk layanan backend (API) dari platform marketplace "Ruang Ternak". API ini dibangun menggunakan Node.js, Express, dan PostgreSQL, serta di-deploy di Vercel.

---

## 🚀 Live API

Endpoint utama API yang telah di-deploy dapat diakses melalui:

**`https://ruang-ternak-backend.vercel.app`**

---

## ✨ Fitur Utama

- **Autentikasi & Otorisasi:** Registrasi dan Login (JWT) dengan sistem peran (Admin, Seller, Customer).
- **Manajemen Profil:** Pengguna dapat melihat dan memperbarui profil mereka (termasuk data spesifik peran).
- **CRUD Ternak:** Seller dapat mengelola (Tambah, Lihat, Update, Hapus) katalog ternak mereka.
- **Sistem Transaksi:** Alur checkout lengkap dari Customer, simulasi pembayaran, dan pembaruan status item.
- **Tracking & Notifikasi:** Seller dapat menginput resi pengiriman, yang secara otomatis mengirim notifikasi ke Customer.
- **Verifikasi Akun:** Alur untuk Seller mengunggah dokumen dan Admin menyetujui/menolak verifikasi.
- **Ulasan & Rating:** Customer dapat memberi ulasan pada ternak yang telah dibeli.
- **API Chat (Simulasi):** API RESTful untuk mengirim dan membaca pesan antar pengguna.
- **Panel Admin:** Endpoint khusus Admin untuk melihat laporan transaksi dan log keamanan.

---

## 💻 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (dihosting di Neon)
- **Autentikasi:** JSON Web Tokens (JWT)
- **Password Hashing:** Bcrypt.js
- **Driver DB:** node-postgres (pg)
- **Deployment:** Vercel

---

## ⚙️ Panduan Instalasi Lokal (Getting Started)

### 1. Prasyarat

- [Node.js](https://nodejs.org/) (v18.x atau lebih baru)
- [PostgreSQL](https://www.postgresql.org/) (Database server, Gunakan Neon untuk versi cloud gratis)
- [Git](https://git-scm.com/)

### 2. Instalasi

1.  **Clone repositori:**

    ```bash
    git clone [https://github.com/AmnanBK/backend-ruang-ternak.git](https://github.com/AmnanBK/backend-ruang-ternak.git)
    cd backend-ruang-ternak
    ```

2.  **Install dependensi:**

    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Buat file `.env` di _root_ proyek dan salin konten dari `.env.example`. Isi nilainya sesuai dengan konfigurasi Anda.

    **File `.env.example`:**

    ```env
    # URL Koneksi ke database PostgreSQL Anda (cth: dari Neon)
    DATABASE_URL="postgresql://user:password@host:port/database"

    # Kunci JWT
    JWT_SECRET="buat_string_rahasia_yang_panjang_dan_unik_disini"

    # Port untuk server lokal
    PORT=3000
    ```

4.  **Setup Database:**
    - Pastikan database PostgreSQL berjalan dan `DATABASE_URL` sudah benar.
    - Jalankan skema SQL untuk membuat semua tabel. Buka `database/schema.sql`, salin semua isinya, dan jalankan di _SQL editor_ database (misalnya, Neon SQL Editor atau DBeaver).
    - **PENTING:** Jalankan _query_ ini untuk mengisi data peran (roles) awal:
      ```sql
      INSERT INTO roles (role_name) VALUES ('admin'), ('seller'), ('customer');
      ```

5.  **Jalankan Server (Development):**
    ```bash
    npm run start:dev
    ```
    Server akan berjalan di `http://localhost:3000`.

---

## 📚 Ringkasan API

- `/api/auth` - Registrasi & Login.
- `/api/profile` - Manajemen profil pengguna.
- `/api/livestock` - CRUD untuk katalog ternak.
- `/api/transactions` - Alur checkout dan simulasi pembayaran.
- `/api/notifications` - Mengambil dan membaca notifikasi.
- `/api/verification` - Alur verifikasi dokumen (Seller & Admin).
- `/api/reviews` - Membuat dan melihat ulasan produk.
- `/api/chat` - Mengirim dan mengambil pesan.
- `/api/admin` - Laporan dan log untuk Admin.

---

## 📂 Struktur Proyek

```
backend-ruang-ternak/
├── config/
├── controllers/
├── database/
├── middleware/
├── routes/
├── .env
├── .env.example
├── .gitignore
├── index.js
├── vercel.json
├── package.json
└── README.md
```
