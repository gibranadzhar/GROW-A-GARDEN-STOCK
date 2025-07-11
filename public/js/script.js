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
            
            const data = await response.json(); 

            if (Array.isArray(data) && data.length > 0) {
                let stockHtml = '<ul class="stock-items">';
                data.forEach(item => {
                    stockHtml += `<li class="stock-item">
                                    <span class="product-name">${item.name || 'Produk Tanpa Nama'}</span>: 
                                    <span class="product-stock">${item.stock || 'Stok Tidak Diketahui'} unit</span>
                                  </li>`;
                });
                stockHtml += '</ul>';
                stockListDiv.innerHTML = stockHtml;
            } else {
                stockListDiv.innerHTML = '<p>Tidak ada data stok yang tersedia.</p>';
            }

        } catch (error) {
            console.error('Ada masalah saat mengambil data stok:', error);
            stockListDiv.innerHTML = `<p style="color: red;">Gagal memuat data stok: ${error.message}. Silakan coba lagi nanti.</p>`;
        } finally {
            loadStockButton.disabled = false; // Aktifkan kembali tombol
            loadStockButton.textContent = 'Lihat Stok Sekarang!'; // Kembalikan teks tombol
        }
    }

    // Tambahkan event listener ke tombol untuk memuat stok saat diklik
    loadStockButton.addEventListener('click', fetchAndDisplayStock);
});
