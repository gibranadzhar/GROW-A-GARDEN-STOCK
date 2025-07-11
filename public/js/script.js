document.addEventListener('DOMContentLoaded', function() {
    const stockListDiv = document.getElementById('stockList');
    const loadStockButton = document.getElementById('loadStockButton');

    // Fungsi asinkron untuk mengambil dan menampilkan stok
    async function fetchAndDisplayStock() {
        stockListDiv.innerHTML = '<p>Memuat data stok...</p>'; // Tampilkan pesan loading
        loadStockButton.disabled = true; // Nonaktifkan tombol saat memuat
        loadStockButton.textContent = 'Memuat...'; // Ubah teks tombol

        try {
            const response = await fetch('https://api.fasturl.link/growagarden/stock');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apiResponse = await response.json(); // Simpan respons lengkap API

            // Periksa apakah ada properti 'result'
            if (apiResponse && apiResponse.result) {
                const resultData = apiResponse.result;
                let allItems = [];

                // Kumpulkan semua item dari berbagai kategori
                // Periksa setiap kategori dan tambahkan itemnya jika ada
                if (Array.isArray(resultData.seeds)) {
                    allItems = allItems.concat(resultData.seeds);
                }
                if (Array.isArray(resultData.gear)) {
                    allItems = allItems.concat(resultData.gear);
                }
                if (Array.isArray(resultData.eggs)) {
                    allItems = allItems.concat(resultData.eggs);
                }
                if (Array.isArray(resultData.cosmetics)) {
                    allItems = allItems.concat(resultData.cosmetics);
                }
                if (Array.isArray(resultData.honey)) {
                    allItems = allItems.concat(resultData.honey);
                }
                // Anda bisa menambahkan kategori lain di sini jika ada

                if (allItems.length > 0) {
                    let stockHtml = '<ul class="stock-items">';
                    allItems.forEach(item => {
                        // Akses properti 'name' dan 'quantity' yang benar
                        const itemName = item.name || 'Produk Tanpa Nama';
                        const itemQuantity = item.quantity !== undefined ? item.quantity : 'Stok Tidak Diketahui'; // quantity bisa 0

                        stockHtml += `<li class="stock-item">
                                        <span class="product-name">${itemName}</span>: 
                                        <span class="product-stock">${itemQuantity} unit</span>
                                      </li>`;
                    });
                    stockHtml += '</ul>';
                    stockListDiv.innerHTML = stockHtml;
                } else {
                    stockListDiv.innerHTML = '<p>Tidak ada data stok yang tersedia di kategori manapun.</p>';
                }

            } else {
                stockListDiv.innerHTML = '<p style="color: red;">Struktur data API tidak seperti yang diharapkan (properti "result" tidak ditemukan).</p>';
            }

        } catch (error) {
            console.error('Ada masalah saat mengambil data stok:', error);
            stockListDiv.innerHTML = `<p style="color: red;">Gagal memuat data stok: ${error.message}. Silakan coba lagi nanti.</p>`;
        } finally {
            loadStockButton.disabled = false; // Aktifkan kembali tombol
            loadStockButton.textContent = 'Lihat Stok Sekarang!'; // Kembalikan teks tombol
        }
    }

    loadStockButton.addEventListener('click', fetchAndDisplayStock);
});
