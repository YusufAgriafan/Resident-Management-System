# Panduan Instalasi

Untuk menginstall project ini di local machine, ikuti langkah-langkah berikut. Prosesnya cukup sederhana dan hanya membutuhkan beberapa menit untuk setup awal.

## Prerequisites

Sebelum memulai, pastikan sudah terinstall beberapa hal berikut di komputer:

- **PHP 8.2 atau lebih baru** - project ini menggunakan Laravel 12 sehingga membutuhkan PHP minimal versi 8.2
- **Composer** - untuk mengelola dependency PHP
- **Node.js** (versi 18 ke atas disarankan) dan **npm** atau **yarn** - untuk menjalankan frontend React
- **MySQL** atau **MariaDB** - untuk database
- **Git** - untuk clone repository

Jika belum terinstall, silakan install terlebih dahulu. Jika sudah lengkap, bisa langsung lanjut ke tahap instalasi.

## Langkah Instalasi

### 1. Clone Repository

Buka terminal dan jalankan command berikut:

```bash
git clone https://github.com/YusufAgriafan/Resident-Management-System.git
cd Resident-Management-System
```

### 2. Setup Backend (Laravel)

Masuk ke folder backend terlebih dahulu:

```bash
cd backend
```

#### Install Dependencies

```bash
composer install
```

Tunggu sampai proses download semua package selesai.

#### Setup Environment File

Copy file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Jika menggunakan Windows dengan command prompt, gunakan command `copy`:

```bash
copy .env.example .env
```

Setelah itu, edit file `.env` sesuaikan dengan konfigurasi database Anda. Buka menggunakan text editor, kemudian cari bagian berikut:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rms_db
DB_USERNAME=root
DB_PASSWORD=
```

Sesuaikan nilai `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` dengan konfigurasi MySQL Anda. Jika menggunakan XAMPP, biasanya username adalah `root` dan password dikosongkan.

#### Generate Application Key

Laravel membutuhkan application key untuk keamanan. Generate menggunakan command berikut:

```bash
php artisan key:generate
```

#### Setup Database

Buat database baru di MySQL sesuai nama yang sudah dikonfigurasi di file `.env`. Database dapat dibuat melalui phpMyAdmin atau CLI:

```sql
CREATE DATABASE rms_db;
```

Kemudian jalankan migration untuk membuat tabel-tabel yang diperlukan:

```bash
php artisan migrate
```

Jika ingin mengisi database dengan sample data, jalankan seeder:

```bash
php artisan db:seed
```

Atau dapat menjalankan sekaligus (drop database, migrate, dan seed ulang):

```bash
php artisan migrate:fresh --seed
```

#### Jalankan Backend Server

```bash
php artisan serve
```

Backend server sekarang berjalan di `http://localhost:8000` atau `http://127.0.0.1:8000`

### 3. Setup Frontend (React)

Buka terminal baru (agar backend tetap berjalan), kemudian kembali ke root folder project:

```bash
cd ..
```

Masuk ke folder frontend:

```bash
cd frontend
```

#### Install Dependencies

```bash
npm install
```

atau jika menggunakan yarn:

```bash
yarn install
```

#### Setup Environment (Opsional)

Jika backend tidak berjalan di `localhost:8000`, buat file `.env` di folder frontend dan isi dengan:

```env
VITE_API_URL=http://localhost:your_backend_port
```

Namun secara default seharusnya sudah mengarah ke `localhost:8000`.

#### Jalankan Frontend Server

```bash
npm run dev
```

atau menggunakan yarn:

```bash
yarn dev
```

Frontend dapat diakses di `http://localhost:5173` (atau port lain yang ditampilkan di terminal).

### 4. Akses Aplikasi

Buka browser dan akses:

```
http://localhost:5173
```

Jika semua langkah berjalan dengan baik, aplikasi Resident Management System sudah dapat digunakan.

## Troubleshooting

Beberapa masalah yang mungkin terjadi:

### Database Connection Error

Periksa kembali file `.env` di folder backend, pastikan konfigurasi database sudah benar. Pastikan juga MySQL service sudah berjalan.

### Storage Permission Error (Linux/Mac)

Jika terjadi error permission pada folder storage, jalankan command berikut:

```bash
chmod -R 775 storage bootstrap/cache
```

### Port Already in Use

Jika port 8000 atau 5173 sudah digunakan, dapat menggunakan port alternatif:

Backend:

```bash
php artisan serve --port=8001
```

Frontend:

```bash
npm run dev -- --port=3000
```

### CORS Error

Jika frontend tidak dapat terhubung ke backend, periksa file `config/cors.php` di folder backend. Pastikan `allowed_origins` sudah mencakup URL frontend yang digunakan.

### Composer/NPM Install Gagal

Coba hapus folder `vendor` (di backend) atau `node_modules` (di frontend) kemudian install ulang. Terkadang masalah ini terjadi karena cache atau incomplete download.

## Production Build

Jika ingin melakukan deployment atau membuat production build:

### Backend

Untuk backend tidak memerlukan build khusus, namun pastikan untuk:

1. Set `APP_ENV=production` di file `.env`
2. Set `APP_DEBUG=false` di file `.env`
3. Jalankan `composer install --optimize-autoloader --no-dev`
4. Jalankan `php artisan config:cache`
5. Jalankan `php artisan route:cache`

### Frontend

```bash
npm run build
```
