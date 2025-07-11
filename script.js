document.addEventListener('DOMContentLoaded', function() {
    const stockListDiv = document.getElementById('stockList'); // Dapatkan elemen div untuk stok

    // Fungsi asinkron untuk mengambil dan menampilkan stok
    async function fetchAndDisplayStock() {
        stockListDiv.innerHTML = '<p>Memuat data stok...</p>'; // Tampilkan pesan loading

        try {
            // Melakukan permintaan ke API
            const response = await fetch('https://api.fasturl.link/growagarden/stock');
            
            // Memeriksa apakah respons berhasil (kode status 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Menguraikan respons JSON
            const data = await response.json(); 

            // Memeriksa apakah data adalah array dan tidak kosong
            if (Array.isArray(data) && data.length > 0) {
                let stockHtml = '<ul class="stock-items">'; // Tambahkan class untuk styling
                data.forEach(item => {
                    // Asumsi setiap item memiliki properti 'name' dan 'stock'
                    // Menambahkan class pada li untuk styling item stok
                    stockHtml += `<li class="stock-item">
                                    <span class="product-name">${item.name || 'Produk Tanpa Nama'}</span>: 
                                    <span class="product-stock">${item.stock || 'Stok Tidak Diketahui'} unit</span>
                                  </li>`;
                });
                stockHtml += '</ul>';
                stockListDiv.innerHTML = stockHtml; // Tampilkan daftar stok di halaman
            } else {
                stockListDiv.innerHTML = '<p>Tidak ada data stok yang tersedia.</p>';
            }

        } catch (error) {
            console.error('Ada masalah saat mengambil data stok:', error);
            stockListDiv.innerHTML = `<p style="color: red;">Gagal memuat data stok: ${error.message}. Silakan coba lagi nanti.</p>`;
        }
    }

    // Panggil fungsi untuk mengambil dan menampilkan stok saat halaman dimuat
    fetchAndDisplayStock();
});
