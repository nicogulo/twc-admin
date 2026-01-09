# WooCommerce Brand Management

Saat ini menu brand management masih hardcoded dan belum terintegrasi dengan WooCommerce. Pada PR ini, kami menambahkan fitur untuk mengelola brand secara dinamis melalui WooCommerce API. cek collection TWC Admin - Brand Management untuk detail implementasi.

## Fitur Utama

- **Brand Management**: Admin dapat menambah, mengedit, dan menghapus brand produk melalui antarmuka admin.
- **Integrasi WooCommerce API**: Semua operasi brand terhubung langsung dengan WooCommerce API untuk memastikan data selalu sinkron.
- **Validasi dan Error Handling**: Implementasi validasi input dan penanganan error untuk memastikan pengalaman pengguna yang baik.

## Perubahan pada Kode

- Penambahan service API untuk brand di `src/services/api.ts`.
- Pembuatan halaman Brand Management di `src/pages/products/BrandManagementPage.tsx`.
- Update routing di `src/routes/routes.tsx` untuk menambahkan rute ke halaman Brand Management.
- Penambahan komponen UI untuk form brand di `src/components/BrandForm.tsx`.

## Cara Menggunakan

1. Akses menu Brand Management di dashboard admin.
2. Gunakan tombol "Add Brand" untuk menambah brand baru.
3. Klik ikon edit pada daftar brand untuk mengubah informasi brand.
4. Gunakan ikon hapus untuk menghapus brand yang tidak diperlukan.
5. Klik View Products untuk melihat produk yang terkait dengan brand tertentu. (modal)

## Filter brand

Pada halaman product form, ditambahkan fitur filter brand pada dropdown selection. Admin dapat mencari brand berdasarkan nama brand yang sudah diinput pada halaman Brand Management.

List brand diambil dari WooCommerce melalui endpoint `/wp-json/wc/v3/products/brands`.
Implementasikan dengan pagination untuk performa yang lebih baik. untuk total page diambil dari response header `X-WP-TotalPages`.
