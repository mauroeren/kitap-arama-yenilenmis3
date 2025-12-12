const resultDiv = document.getElementById('results');

// Kitap Arama Fonksiyonu
function searchBooksFromInput() {
    const query = document.getElementById('search').value;
    if (!query) {
        showToast("Lütfen bir kitap adı girin!", "error");
        return;
    }

    // 1. Önce eski sonuçları temizle
    resultDiv.innerHTML = '';

    // 2. SKELETON LOADING GÖSTER (Profesyonel Dokunuş)
    // API cevap verene kadar 4 tane sahte yükleniyor kutusu göster
    for (let i = 0; i < 4; i++) {
        resultDiv.innerHTML += `
            <div class="skeleton-card">
                <div class="skeleton sk-img"></div>
                <div class="skeleton sk-title"></div>
                <div class="skeleton sk-text"></div>
            </div>
        `;
    }

    // 3. API İsteği
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
        .then(response => response.json())
        .then(data => {
            // Loading'i kaldır
            resultDiv.innerHTML = '';

            if (data.totalItems === 0) {
                resultDiv.innerHTML = '<p style="font-size:1.2rem; grid-column: 1/-1; text-align:center;">😔 Aradığınız kitap bulunamadı.</p>';
                showToast("Kitap bulunamadı.", "error");
                return;
            }

            // Kitapları Listele
            data.items.forEach(item => {
                const title = item.volumeInfo.title || 'Başlıksız';
                const authors = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Yazar Bilinmiyor';
                const img = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x192.png?text=No+Cover';
                const description = item.volumeInfo.description || 'Açıklama bulunmuyor.';
                const link = item.volumeInfo.previewLink;

                // Kart HTML'i oluştur
                const bookEl = document.createElement('div');
                bookEl.className = 'book';
                // 3D Tilt efekti için gerekli ayarlar
                bookEl.setAttribute('data-tilt', '');
                bookEl.setAttribute('data-tilt-max', '15');
                bookEl.setAttribute('data-tilt-speed', '400');
                bookEl.setAttribute('data-tilt-glare', '');
                bookEl.setAttribute('data-tilt-max-glare', '0.3');

                bookEl.innerHTML = `
                    <div class="book-content" onclick="openModal('${title.replace(/'/g, "\\'")}', '${authors.replace(/'/g, "\\'")}', '${img}', '${description.replace(/'/g, "\\'").replace(/\n/g, ' ')}', '${link}')">
                        <img src="${img}" alt="${title}">
                        <div class="book-info">
                            <h3>${title}</h3>
                            <p>${authors}</p>
                        </div>
                    </div>
                `;
                resultDiv.appendChild(bookEl);
            });

            // VanillaTilt kütüphanesini yeni eklenen kartlar için tetikle
            VanillaTilt.init(document.querySelectorAll(".book"));
            
            showToast(`${data.items.length} kitap bulundu!`, "success");
        })
        .catch(error => {
            console.error('Hata:', error);
            resultDiv.innerHTML = '<p>Bir hata oluştu.</p>';
            showToast("Bağlantı hatası!", "error");
        });
}

// Modal Açma Fonksiyonu
function openModal(title, author, img, desc, link) {
    document.getElementById('m-title').innerText = title;
    document.getElementById('m-author').innerText = author;
    document.getElementById('m-img').src = img;
    
    // Açıklama çok uzunsa kısalt
    const shortDesc = desc.length > 300 ? desc.substring(0, 300) + '...' : desc;
    document.getElementById('m-desc').innerText = shortDesc;
    
    document.getElementById('m-link').href = link;
    
    // Modalı Aktif Et
    document.getElementById('modal-overlay').classList.add('active');
}

// Toast Bildirim Gösterme
function showToast(message, type) {
    const toast = document.getElementById("toast");
    const msg = document.getElementById("toast-msg");
    
    msg.innerText = message;
    toast.className = "show"; // Animasyonu başlat
    
    if (type === 'error') {
        toast.style.backgroundColor = "#ff4757";
        toast.querySelector('i').className = "fas fa-exclamation-circle";
    } else {
        toast.style.backgroundColor = "#2ed573";
        toast.querySelector('i').className = "fas fa-check-circle";
    }

    // 3 saniye sonra kaybolsun
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}
