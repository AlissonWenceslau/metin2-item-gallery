document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById("gallery");
    const imageCount = document.getElementById("image-count");
    const tooltip = document.getElementById("custom-tooltip");
    const backToTopBtn = document.getElementById("back-to-top");

    if (typeof images === "undefined") {
        imageCount.textContent = "Erro ao carregar lista de imagens.";
        return;
    }

    // Contagem de itens com nome mapeado
    let namedCount = 0;

    imageCount.textContent = `${images.length} Itens Encontrados`;

    // Use DocumentFragment for performance
    const fragment = document.createDocumentFragment();

    images.forEach(filename => {
        // Only target .png or common image files just in case
        if (!filename.match(/\.(png|jpe?g|webp|gif)$/i)) return;

        // ID based on filename without extension
        const id = filename.substring(0, filename.lastIndexOf('.'));

        // Format ID to remove leading zeros for numerical IDs
        const displayId = !isNaN(id) && id.trim() !== '' ? parseInt(id, 10) : id;

        // Lookup item name from generated mapping
        const itemName = (typeof itemNames !== 'undefined' && itemNames[displayId])
            ? itemNames[displayId]
            : null;

        if (itemName) namedCount++;

        // Label shown on card: name if available, otherwise compact ID
        const cardLabel = itemName || `#${displayId}`;
        // Tooltip full info
        const tooltipText = itemName
            ? `${itemName}  ·  ID: ${displayId}`
            : `ID: ${displayId}`;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'gallery-item';
        itemDiv.dataset.id = displayId;
        if (!itemName) itemDiv.classList.add('no-name');

        const img = document.createElement('img');
        img.src = `img/${filename}`;
        img.alt = itemName ? `${itemName} (ID: ${displayId})` : `Item ${displayId}`;
        img.loading = "lazy"; // Native lazy loading

        const nameLabel = document.createElement('span');
        nameLabel.className = 'item-label';
        nameLabel.textContent = cardLabel;
        nameLabel.title = tooltipText;

        itemDiv.appendChild(img);
        itemDiv.appendChild(nameLabel);
        fragment.appendChild(itemDiv);

        // Tooltip logic
        itemDiv.addEventListener('mouseenter', () => {
            tooltip.innerHTML = itemName
                ? `<span class="tooltip-name">${itemName}</span><span class="tooltip-id">ID: ${displayId}</span>`
                : `<span class="tooltip-id">ID: ${displayId}</span>`;
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

    // Update count with name stats
    imageCount.textContent = `${images.length} Itens  ·  ${namedCount} nomeados`;

    // Back to top logic
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove("hidden");
        } else {
            backToTopBtn.classList.add("hidden");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
});

