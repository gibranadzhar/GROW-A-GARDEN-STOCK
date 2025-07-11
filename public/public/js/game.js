document.addEventListener('DOMContentLoaded', function() {
    const gameImage = document.getElementById('gameImage');
    const guessInput = document.getElementById('guessInput');
    const submitGuessBtn = document.getElementById('submitGuess');
    const nextPictureBtn = document.getElementById('nextPicture');
    const feedbackMessage = document.getElementById('feedbackMessage');

    let currentAnswer = ''; // Untuk menyimpan jawaban yang benar

    async function fetchNewPicture() {
        gameImage.src = 'https://via.placeholder.com/300?text=Memuat+Gambar...'; // Placeholder loading
        feedbackMessage.textContent = ''; // Kosongkan pesan feedback
        guessInput.value = ''; // Kosongkan input
        guessInput.disabled = false; // Aktifkan input
        submitGuessBtn.disabled = false; // Aktifkan tombol tebak
        submitGuessBtn.style.display = 'inline-block'; // Tampilkan tombol tebak
        nextPictureBtn.style.display = 'none'; // Sembunyikan tombol next

        try {
            const response = await fetch('https://api.fasturl.link/game/tebakgambar');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Asumsi struktur API: { status: 200, content: "Success", result: { imageUrl: "...", answer: "..." } }
            if (data && data.result && data.result.imageUrl && data.result.answer) {
                gameImage.src = data.result.imageUrl;
                currentAnswer = data.result.answer.toLowerCase().trim(); // Simpan jawaban dan bersihkan
            } else {
                feedbackMessage.textContent = 'Gagal memuat gambar atau format API tidak sesuai.';
                feedbackMessage.style.color = 'red';
                gameImage.src = 'https://via.placeholder.com/300?text=Error';
            }
        } catch (error) {
            console.error('Error fetching game picture:', error);
            feedbackMessage.textContent = `Error: ${error.message}. Coba lagi nanti.`;
            feedbackMessage.style.color = 'red';
            gameImage.src = 'https://via.placeholder.com/300?text=Error';
        }
    }

    function checkGuess() {
        const userGuess = guessInput.value.toLowerCase().trim();
        if (userGuess === '') {
            feedbackMessage.textContent = 'Jawaban tidak boleh kosong!';
            feedbackMessage.style.color = 'orange';
            return;
        }

        if (userGuess === currentAnswer) {
            feedbackMessage.textContent = '🎉 Betul sekali! 🎉';
            feedbackMessage.style.color = 'green';
            guessInput.disabled = true; // Nonaktifkan input
            submitGuessBtn.style.display = 'none'; // Sembunyikan tombol tebak
            nextPictureBtn.style.display = 'inline-block'; // Tampilkan tombol next
        } else {
            feedbackMessage.textContent = 'Salah. Coba lagi!';
            feedbackMessage.style.color = 'red';
        }
    }

    // Event Listeners
    submitGuessBtn.addEventListener('click', checkGuess);
    guessInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });
    nextPictureBtn.addEventListener('click', fetchNewPicture);

    // Muat gambar pertama kali
    fetchNewPicture();
});
