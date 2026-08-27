document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById("gallery");
    const imageCount = document.getElementById("image-count");
    const tooltip = document.getElementById("custom-tooltip");

    if (typeof images === "undefined") {
        imageCount.textContent = "Erro ao carregar lista de imagens.";
        return;
    }

    imageCount.textContent = `${images.length} Imagens Encontradas`;

    // Use DocumentFragment for performance
    const fragment = document.createDocumentFragment();

    images.forEach(filename => {
        // Only target .png or common image files just in case
        if (!filename.match(/\.(png|jpe?g|webp|gif)$/i)) return;

        // ID based on filename without extension
        const id = filename.substring(0, filename.lastIndexOf('.'));

        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        itemDiv.dataset.id = id;

        const img = document.createElement('img');
        img.src = `img/${filename}`;
        img.alt = `Item ${id}`;
        img.loading = "lazy"; // Native lazy loading

        itemDiv.appendChild(img);
        fragment.appendChild(itemDiv);

        // Format ID to remove leading zeros for numerical IDs
        const displayId = !isNaN(id) && id.trim() !== '' ? parseInt(id, 10) : id;

        // Tooltip logic
        itemDiv.addEventListener('mouseenter', (e) => {
            tooltip.textContent = `ID: ${displayId}`;
            tooltip.classList.remove('hidden');
        });

        itemDiv.addEventListener('mousemove', (e) => {
            // Position tooltip slightly offset from cursor
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY + 15}px`;
        });

        itemDiv.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    });

    gallery.appendChild(fragment);
});
