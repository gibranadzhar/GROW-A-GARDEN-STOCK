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
                // Menggunakan destructuring dan spread operator untuk lebih ringkas
                const categories = ['seeds', 'gear', 'eggs', 'cosmetics', 'honey'];
                categories.forEach(category => {
                    if (Array.isArray(resultData[category])) {
                        allItems = allItems.concat(resultData[category]);
                    }
                });
                
                // Urutkan item berdasarkan nama agar lebih rapi
                allItems.sort((a, b) => {
                    const nameA = (a.name || '').toLowerCase(); // Pastikan ada string, konversi ke lowercase
                    const nameB = (b.name || '').toLowerCase(); // Pastikan ada string, konversi ke lowercase
                    return nameA.localeCompare(nameB); // Gunakan localeCompare untuk pengurutan yang benar
                });

                if (allItems.length > 0) {
                    let stockHtml = '<ul class="stock-items">';
                    allItems.forEach(item => {
                        const itemName = item.name || 'Produk Tanpa Nama';
                        const itemQuantity = item.quantity !== undefined ? item.quantity : 'Stok Tidak Diketahui';
                        const imageUrl = item.imageUrl || ''; // Dapatkan URL gambar, jika ada
                        
                        stockHtml += `<li class="stock-item">`;
                        // Tambahkan tag img jika imageUrl tersedia
                        if (imageUrl) {
                            stockHtml += `<img src="${imageUrl}" alt="${itemName}" class="stock-item-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/60?text=No+Image';">`;
                        } else {
                             // Tampilkan placeholder jika tidak ada URL gambar sama sekali
                            stockHtml += `<img src="https://via.placeholder.com/60?text=No+Image" alt="No image available for ${itemName}" class="stock-item-image">`;
                        }
                        stockHtml += `<div class="item-details">
                                        <span class="product-name">${itemName}</span><br>
                                        <span class="product-stock">${itemQuantity} unit</span>
                                      </div>
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
            loadStockButton.disabled = false;
            loadStockButton.textContent = 'Lihat Stok Sekarang!';
        }
    }

    loadStockButton.addEventListener('click', fetchAndDisplayStock);
});
