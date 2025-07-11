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
            
            const apiResponse = await response.json();

            if (apiResponse && apiResponse.result) {
                const resultData = apiResponse.result;
                let formattedStockHtml = ''; // String untuk menampung seluruh HTML stok

                // Definisikan kategori yang ingin ditampilkan beserta judul dan emoji
                const categoriesToDisplay = [
                    { key: 'seeds', title: 'Seeds Stock', emoji: '🌱' },
                    { key: 'gear', title: 'Gear Stock', emoji: '⚙️' },
                    { key: 'eggs', title: 'Egg Stock', emoji: '🥚' },
                    { key: 'cosmetics', title: 'Cosmetic Items', emoji: '🎨' }
                    // Anda bisa menambahkan kategori 'honey' di sini jika ingin menampilkannya
                    // { key: 'honey', title: 'Honey Items', emoji: '🍯' }
                ];

                categoriesToDisplay.forEach(categoryInfo => {
                    const categoryItems = resultData[categoryInfo.key];

                    if (Array.isArray(categoryItems) && categoryItems.length > 0) {
                        // Urutkan item dalam kategori berdasarkan nama
                        categoryItems.sort((a, b) => {
                            const nameA = (a.name || '').toLowerCase();
                            const nameB = (b.name || '').toLowerCase();
                            return nameA.localeCompare(nameB);
                        });

                        // Tambahkan judul kategori dengan emoji
                        formattedStockHtml += `<h3>${categoryInfo.emoji} *${categoryInfo.title}*</h3>`;
                        formattedStockHtml += `<ul class="category-list">`; // Tambahkan class untuk styling

                        categoryItems.forEach(item => {
                            const itemName = item.name || 'Produk Tanpa Nama';
                            const itemQuantity = item.quantity !== undefined ? item.quantity : 'Stok Tidak Diketahui';
                            // const imageUrl = item.imageUrl || ''; // Jika ingin menampilkan gambar, ini masih bisa digunakan

                            let itemPrefix = '-'; // Default prefix
                            // Beberapa item di 'Cosmetics' contohnya memiliki tanda '> ⚙️'
                            if (categoryInfo.key === 'cosmetics' && itemName === 'Round Metal Arbour') {
                                itemPrefix = '> ⚙️';
                            }
                            // Anda bisa menambahkan logika emoji spesifik per item di sini jika diperlukan

                            formattedStockHtml += `<li>${itemPrefix} ${itemName} x${itemQuantity}</li>`;
                            // Anda bisa menambahkan gambar di sini jika ingin:
                            // if (imageUrl) {
                            //     formattedStockHtml += `<img src="${imageUrl}" alt="${itemName}" class="stock-item-image" onerror="this.onerror=null;this.src='https://via.placeholder.com/20?text=No+Img';">`;
                            // }
                        });
                        formattedStockHtml += `</ul>`;
                    }
                });

                // Tambahkan copyright notice di akhir
                formattedStockHtml += `<p class="copyright-text">\`Copyright © growagarden.brann\`</p>`;

                stockListDiv.innerHTML = formattedStockHtml;

            } else {
                stockListDiv.innerHTML = '<p>Tidak ada data stok yang tersedia atau struktur API tidak sesuai.</p>';
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
