document.addEventListener('DOMContentLoaded', function() {
    const stockListDiv = document.getElementById('stockList');
    const loadStockButton = document.getElementById('loadStockButton');
    const eventListDiv = document.getElementById('eventList');
    const countdownTimerDiv = document.getElementById('countdownTimer'); // Ambil elemen hitung mundur

    const RESET_INTERVAL_MS = 5 * 60 * 1000; // 5 menit dalam milidetik
    let countdownInterval; // Variabel untuk menyimpan ID interval

    // Fungsi untuk memformat angka menjadi dua digit (misal: 5 -> "05")
    function formatTime(num) {
        return num < 10 ? '0' + num : num;
    }

    // Fungsi untuk memulai/memperbarui hitung mundur
    function startCountdown() {
        clearInterval(countdownInterval); // Hentikan interval sebelumnya jika ada

        const now = new Date();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();

        // Hitung menit berikutnya yang merupakan kelipatan 5
        const nextResetMinute = Math.ceil((currentMinutes + 1) / 5) * 5;
        let nextResetTime = new Date(now);

        if (nextResetMinute === 60) { // Jika menit berikutnya adalah 60, berarti di jam berikutnya
            nextResetTime.setHours(now.getHours() + 1);
            nextResetTime.setMinutes(0);
            nextResetTime.setSeconds(0);
        } else {
            nextResetTime.setMinutes(nextResetMinute);
            nextResetTime.setSeconds(0);
        }

        // Jika waktu reset sudah lewat di detik yang sama, geser ke siklus 5 menit berikutnya
        if (nextResetTime.getTime() < now.getTime()) {
            nextResetTime = new Date(nextResetTime.getTime() + RESET_INTERVAL_MS);
        }


        // Fungsi yang akan dijalankan setiap detik
        countdownInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const timeRemaining = nextResetTime.getTime() - currentTime;

            if (timeRemaining <= 0) {
                // Jika waktu habis, reset hitung mundur ke 5:00 dan panggil fetchDataAndDisplay
                countdownTimerDiv.textContent = 'Update berikutnya dalam: 00:00';
                clearInterval(countdownInterval);
                fetchDataAndDisplay(); // Panggil fungsi untuk memuat ulang data
                startCountdown(); // Mulai hitung mundur lagi untuk siklus berikutnya
                return;
            }

            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            countdownTimerDiv.textContent = `Update berikutnya dalam: ${formatTime(minutes)}:${formatTime(seconds)}`;
        }, 1000); // Perbarui setiap 1 detik
    }

    // Fungsi asinkron untuk mengambil dan menampilkan data (termasuk stok dan event)
    async function fetchDataAndDisplay() {
        stockListDiv.innerHTML = '<p>Memuat data stok...</p>';
        eventListDiv.innerHTML = '<p>Memuat informasi event...</p>';
        loadStockButton.disabled = true;
        loadStockButton.textContent = 'Memuat...';

        try {
            const response = await fetch('https://api.fasturl.link/growagarden/stock');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResponse = await response.json();

            if (apiResponse && apiResponse.result) {
                const resultData = apiResponse.result;
                let formattedStockHtml = '';
                let formattedEventHtml = '';

                // --- BAGIAN MENAMPILKAN STOK ---
                const categoriesToDisplay = [
                    { key: 'seeds', title: 'Seeds Stock', emoji: '🌱' },
                    { key: 'gear', title: 'Gear Stock', emoji: '⚙️' },
                    { key: 'eggs', title: 'Egg Stock', emoji: '🥚' },
                    { key: 'cosmetics', title: 'Cosmetic Items', emoji: '🎨' }
                ];

                categoriesToDisplay.forEach(categoryInfo => {
                    const categoryItems = resultData.hasOwnProperty(categoryInfo.key) ? resultData[categoryInfo.key] : [];

                    if (Array.isArray(categoryItems) && categoryItems.length > 0) {
                        categoryItems.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

                        formattedStockHtml += `<h3>${categoryInfo.emoji} *${categoryInfo.title}*</h3>`;
                        formattedStockHtml += `<ul class="category-list">`;

                        categoryItems.forEach(item => {
                            const itemName = item.name || 'Produk Tanpa Nama';
                            const itemQuantity = item.quantity !== undefined ? item.quantity : 'Stok Tidak Diketahui';
                            const imageUrl = item.imageUrl || '';
                            let itemPrefix = '-';

                            // Logika emoji spesifik untuk Cosmetics
                            if (categoryInfo.key === 'cosmetics') {
                                if (itemName === 'Brown Bench') itemPrefix = '🪑';
                                else if (itemName === 'Torch') itemPrefix = '🔥';
                                else if (itemName === 'Shovel Grave') itemPrefix = '⚰️';
                                else if (itemName === 'Large Path Tile') itemPrefix = '🟫';
                                else if (itemName === 'Round Metal Arbour') itemPrefix = '> ⚙️';
                                else if (itemName === 'Mini TV') itemPrefix = '📺';
                                else if (itemName === 'Small Wood Flooring') itemPrefix = '🪵';
                                else itemPrefix = '🎨';
                            }

                            formattedStockHtml += `<li>`;
                            if (imageUrl) {
                                formattedStockHtml += `<img src="${imageUrl}" alt="${itemName}" class="stock-item-image-inline" onerror="this.onerror=null;this.src='https://via.placeholder.com/24?text=No+Img';">`;
                            }
                            formattedStockHtml += `${itemPrefix} ${itemName} x${itemQuantity}</li>`;
                        });
                        formattedStockHtml += `</ul>`;
                    }
                });

                formattedStockHtml += `<p class="copyright-text">\`Copyright © growagarden.brann\`</p>`;
                stockListDiv.innerHTML = formattedStockHtml;

                // --- BAGIAN MENAMPILKAN EVENT ---
                formattedEventHtml += '<h4>Current Weather:</h4>';
                if (resultData.weather && resultData.weather.type) {
                    const weatherType = resultData.weather.type;
                    const isActive = resultData.weather.active;
                    formattedEventHtml += `<p><strong>${weatherType.charAt(0).toUpperCase() + weatherType.slice(1)}</strong>: ${isActive ? 'Active' : 'Inactive'}</p>`;
                } else {
                    formattedEventHtml += '<p>No current weather data.</p>';
                }

                formattedEventHtml += '<h4>Event-Related Items:</h4>';
                if (Array.isArray(resultData.honey) && resultData.honey.length > 0) {
                    const eventItems = resultData.honey.filter(item => item.category === 'EVENT');
                    if (eventItems.length > 0) {
                        eventItems.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
                        formattedEventHtml += '<ul class="event-item-list">';
                        eventItems.forEach(item => {
                            const itemName = item.name || 'Event Item';
                            const itemQuantity = item.quantity !== undefined ? item.quantity : 'N/A';
                            const imageUrl = item.imageUrl || '';
                            formattedEventHtml += `<li>✨ `;
                            if (imageUrl) {
                                formattedEventHtml += `<img src="${imageUrl}" alt="${itemName}" class="stock-item-image-inline" onerror="this.onerror=null;this.src='https://via.placeholder.com/24?text=No+Img';">`;
                            }
                            formattedEventHtml += `${itemName} x${itemQuantity}</li>`;
                        });
                        formattedEventHtml += '</ul>';
                    } else {
                        formattedEventHtml += '<p>No specific event items currently.</p>';
                    }
                } else {
                    formattedEventHtml += '<p>No event item data available.</p>';
                }

                formattedEventHtml += '<h4>Recent Weather History:</h4>';
                if (Array.isArray(resultData.weatherHistory) && resultData.weatherHistory.length > 0) {
                    const recentHistory = resultData.weatherHistory.slice(-3).reverse();
                    formattedEventHtml += '<ul class="weather-history-list">';
                    recentHistory.forEach(event => {
                        const type = event.type || 'Unknown';
                        const startTime = event.startTime ? new Date(event.startTime).toLocaleString() : 'N/A';
                        const endTime = event.endTime ? new Date(event.endTime).toLocaleString() : 'N/A';
                        formattedEventHtml += `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: From ${startTime} to ${endTime}</li>`;
                    });
                    formattedEventHtml += '</ul>';
                } else {
                    formattedEventHtml += '<p>No recent weather history available.</p>';
                }

                eventListDiv.innerHTML = formattedEventHtml;

            } else {
                stockListDiv.innerHTML = '<p>Tidak ada data atau struktur API salah.</p>';
                eventListDiv.innerHTML = '<p>Gagal memuat info event.</p>';
            }

        } catch (error) {
            console.error('Ada masalah saat mengambil data:', error);
            stockListDiv.innerHTML = `<p style="color: red;">Gagal memuat data stok: ${error.message}.</p>`;
            eventListDiv.innerHTML = `<p style="color: red;">Gagal memuat informasi event: ${error.message}.</p>`;
        } finally {
            loadStockButton.disabled = false;
            loadStockButton.textContent = 'Lihat Stok Sekarang!';
        }
    }

    // Panggil fetchDataAndDisplay saat halaman pertama kali dimuat
    // dan juga mulai hitung mundur
    fetchDataAndDisplay();
    startCountdown();

    // Tambahkan event listener untuk tombol (jika pengguna ingin memuat ulang manual)
    loadStockButton.addEventListener('click', fetchDataAndDisplay);
});
