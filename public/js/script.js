document.addEventListener('DOMContentLoaded', function() {
    const stockListDiv = document.getElementById('stockList');
    const loadStockButton = document.getElementById('loadStockButton');
    const eventListDiv = document.getElementById('eventList');
    const countdownTimerDiv = document.getElementById('countdownTimer');
    const weatherEffectsDiv = document.getElementById('weatherEffects');

    // --- Elemen untuk Gate Username Roblox ---
    const robloxGate = document.getElementById('robloxGate');
    const robloxUsernameInput = document.getElementById('robloxUsernameInput');
    const enterWebsiteButton = document.getElementById('enterWebsiteButton');
    const gateMessage = document.getElementById('gateMessage');

    // Elemen konten utama yang akan disembunyikan/ditampilkan
    const mainContentElements = document.querySelectorAll('.hidden-until-enter');

    // --- Logic Gate Username ---
    function checkAndEnterWebsite() {
        const username = robloxUsernameInput.value.trim();
        if (username.length > 0) { // Validasi sederhana: username tidak boleh kosong
            localStorage.setItem('roblox_username', username); // Simpan username
            robloxGate.style.display = 'none'; // Sembunyikan gate

            // Tampilkan elemen-elemen utama
            mainContentElements.forEach(el => {
                el.classList.remove('hidden-until-enter');
                el.classList.add('visible-after-enter');
            });

            // Mulai inisialisasi fitur Grow A Garden
            fetchDataAndDisplay();
            startCountdown();

        } else {
            gateMessage.textContent = 'Username tidak boleh kosong!';
            gateMessage.style.color = 'red';
        }
    }

    // Cek apakah username sudah ada di localStorage saat halaman dimuat
    const storedUsername = localStorage.getItem('roblox_username');
    if (storedUsername) {
        robloxGate.style.display = 'none'; // Langsung sembunyikan gate
        mainContentElements.forEach(el => {
            el.classList.remove('hidden-until-enter');
            el.classList.add('visible-after-enter');
        });
        // Mulai inisialisasi fitur Grow A Garden
        fetchDataAndDisplay();
        startCountdown();
    } else {
        // Tampilkan gate jika belum ada username
        robloxGate.style.display = 'flex'; // Gunakan flex agar konten di tengah
        mainContentElements.forEach(el => {
            el.classList.add('hidden-until-enter'); // Pastikan tersembunyi
        });
    }

    // Event listener untuk tombol masuk di gate
    enterWebsiteButton.addEventListener('click', checkAndEnterWebsite);
    robloxUsernameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkAndEnterWebsite();
        }
    });

    // --- LOGIC COUNTDOWN (5 MENIT) ---
    const RESET_INTERVAL_MS = 5 * 60 * 1000; // 5 menit dalam milidetik
    let countdownInterval;

    function formatTime(num) {
        return num < 10 ? '0' + num : num;
    }

    function startCountdown() {
        clearInterval(countdownInterval);

        const now = new Date();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();

        const nextResetMinute = Math.ceil((currentMinutes + 1) / 5) * 5;
        let nextResetTime = new Date(now);

        if (nextResetMinute === 60) {
            nextResetTime.setHours(now.getHours() + 1);
            nextResetTime.setMinutes(0);
            nextResetTime.setSeconds(0);
            nextResetTime.setMilliseconds(0);
        } else {
            nextResetTime.setMinutes(nextResetMinute);
            nextResetTime.setSeconds(0);
            nextResetTime.setMilliseconds(0);
        }
        
        if (nextResetTime.getTime() < now.getTime() && now.getSeconds() >= 0) {
             nextResetTime = new Date(nextResetTime.getTime() + RESET_INTERVAL_MS);
        }

        countdownInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const timeRemaining = nextResetTime.getTime() - currentTime;

            if (timeRemaining <= 0) {
                countdownTimerDiv.textContent = 'Update berikutnya dalam: 00:00';
                clearInterval(countdownInterval);
                fetchDataAndDisplay(); // Panggil fungsi untuk memuat ulang data
                startCountdown(); // Mulai hitung mundur lagi untuk siklus berikutnya
                return;
            }

            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            countdownTimerDiv.textContent = `Update berikutnya dalam: ${formatTime(minutes)}:${formatTime(seconds)}`;
        }, 1000);
    }

    // --- LOGIC FETCH DATA API ---
    // Pemetaan Emoji untuk Item
    const itemEmojis = {
        'Carrot': '🥕', 'Strawberry': '🍓', 'Tomato': '🍅', 'Blueberry': '🫐', 'Orange Tulip': '🌷',
        'Tanning Mirror': '🪞', 'Recall Wrench': '🔧', 'Trowel': '🥄', 'Watering Can': '💧',
        'Favorite Tool': '❤️', 'Cleaning Spray': '🧼', 'Harvest Tool': '🧺',
        'Bee Egg': '🐝', 'Common Egg': '🥚',
        'Classic Gnome Crate': '📦', 'Sign Crate': '🪧', 'Medium Stone Table': '🪨',
        'Torch': '🔥', 'Brown Stone Pillar': '🟫', 'Brick Stack': '🧱',
        'Water Trough': '🚿', 'Mini TV': '📺', 'Orange Umbrella': '⛱️',
        'Bee Chair': '🪑', 'Flower Seed Pack': '🌻', 'Hive Fruit': '🍎',
        'Honey Comb': '🍯', 'Honey Torch': '🔥', 'Honey Walkway': '🛣️',
        'Lavender': '🌸', 'Nectarine': '🍑', 'Nectarshade': '🌿', 'Pollen Radar': '📡'
    };

    const categoryDefaultEmojis = {
        'seeds': '🌱', 'gear': '⚙️', 'eggs': '🥚', 'cosmetics': '✨', 'honey': '🍯', 'EVENT': '✨'
    };

    // Pemetaan Emoji untuk Cuaca
    const weatherEmojis = {
        'normal': '☀️ Normal', 'rain': '🌧️ Hujan', 'tornado': '🌪️ Tornado', 'storm': '⛈️ Badai',
        'snow': '❄️ Bersalju', 'wind': '🌬️ Berangin', 'unknown': '❓ Cuaca Tidak Diketahui'
    };

    function setWeatherEffect(weatherType) {
        weatherEffectsDiv.className = 'weather-effects-container';
        if (weatherType) {
            weatherEffectsDiv.classList.add(`weather-${weatherType.toLowerCase()}`);
        }
    }

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
                        formattedStockHtml += `<h3>${categoryInfo.emoji} *${categoryInfo.title}*</h3><ul class="category-list">`;
                        categoryItems.forEach(item => {
                            const itemName = item.name || 'Produk Tanpa Nama';
                            const itemQuantity = item.quantity !== undefined ? item.quantity : 'Stok Tidak Diketahui';
                            const emoji = itemEmojis[itemName] || categoryDefaultEmojis[categoryInfo.key] || '-';
                            formattedStockHtml += `<li>${emoji} ${itemName} x${itemQuantity}</li>`;
                        });
                        formattedStockHtml += `</ul>`;
                    }
                });
                formattedStockHtml += `<p class="copyright-text">\`Copyright © growagarden.brann\`</p>`;
                stockListDiv.innerHTML = formattedStockHtml;

                formattedEventHtml += '<h4>Current Weather:</h4>';
                if (resultData.weather && resultData.weather.type) {
                    const weatherType = resultData.weather.type.toLowerCase();
                    const isActive = resultData.weather.active;
                    const weatherDisplay = weatherEmojis[weatherType] || weatherEmojis['unknown'];
                    formattedEventHtml += `<p><strong>${weatherDisplay}</strong>: ${isActive ? 'Active' : 'Inactive'}</p>`;
                    setWeatherEffect(weatherType);
                } else {
                    formattedEventHtml += '<p>No current weather data.</p>';
                    setWeatherEffect('normal');
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
                            const emoji = itemEmojis[itemName] || categoryDefaultEmojis['EVENT'] || '✨';
                            formattedEventHtml += `<li>${emoji} ${itemName} x${itemQuantity}</li>`;
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
                        const typeDisplay = weatherEmojis[type.toLowerCase()] || weatherEmojis['unknown'];
                        const startTime = event.startTime ? new Date(event.startTime).toLocaleString() : 'N/A';
                        const endTime = event.endTime ? new Date(event.endTime).toLocaleString() : 'N/A';
                        formattedEventHtml += `<li>${typeDisplay}: From ${startTime} to ${endTime}</li>`;
                    });
                    formattedEventHtml += '</ul>';
                } else {
                    formattedEventHtml += '<p>No recent weather history available.</p>';
                }
                eventListDiv.innerHTML = formattedEventHtml;

            } else {
                stockListDiv.innerHTML = '<p>Tidak ada data atau struktur API salah.</p>';
                eventListDiv.innerHTML = '<p>Gagal memuat info event.</p>';
                setWeatherEffect('normal');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            stockListDiv.innerHTML = `<p style="color: red;">Gagal memuat stok: ${error.message}.</p>`;
            eventListDiv.innerHTML = `<p style="color: red;">Gagal memuat informasi event: ${error.message}.</p>`;
            setWeatherEffect('normal');
        } finally {
            loadStockButton.disabled = false;
            loadStockButton.textContent = 'Lihat Stok Sekarang!';
        }
    }

    // --- INISIALISASI UNTUK HALAMAN GROW A GARDEN SETELAH GATE ---
    // Logika panggilan fetchDataAndDisplay dan startCountdown dipindahkan ke checkAndEnterWebsite

    loadStockButton.addEventListener('click', fetchDataAndDisplay);
});
