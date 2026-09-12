document.addEventListener("DOMContentLoaded", () => {
    const gallery      = document.getElementById("gallery");
    const imageCount   = document.getElementById("image-count");
    const tooltip      = document.getElementById("custom-tooltip");
    const backToTopBtn = document.getElementById("back-to-top");
    const filterBar    = document.getElementById("filter-bar");

    if (typeof images === "undefined") {
        imageCount.textContent = "Erro ao carregar lista de imagens.";
        return;
    }

    // ── Definição das categorias ──────────────────────────────────────────────
    const CATEGORIES = [
        { id: 'all',      label: 'Todos',          icon: '🗂️',  types: null },
        { id: 'weapon',   label: 'Armas',           icon: '⚔️',  types: [1, 19] },
        { id: 'armor',    label: 'Armaduras',       icon: '🛡️',  types: [2, 20] },
        { id: 'use',      label: 'Usáveis',         icon: '🧪',  types: [3, 4, 16] },
        { id: 'material', label: 'Materiais',       icon: '🪨',  types: [5, 14] },
        { id: 'quest',    label: 'Missão',          icon: '📜',  types: [18, 24] },
        { id: 'pet',      label: 'Pets',            icon: '🐾',  types: [28, 27, 29] },
        { id: 'special',  label: 'Especial',        icon: '✨',  types: [6, 23, 34, 35, 36, 37] },
        { id: 'other',    label: 'Outros',          icon: '📦',  types: [0, 8, 10, 12, 13, 15, 21, 22] },
    ];

    // ── Gerar botões da barra de filtro ───────────────────────────────────────
    let activeFilter = 'all';

    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className     = 'filter-btn' + (cat.id === 'all' ? ' active' : '');
        btn.dataset.filter = cat.id;
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', cat.id === 'all' ? 'true' : 'false');
        btn.setAttribute('id', `filter-${cat.id}`);
        btn.innerHTML = `<span class="filter-icon">${cat.icon}</span><span class="filter-label">${cat.label}</span>`;

        btn.addEventListener('click', () => applyFilter(cat.id));
        filterBar.appendChild(btn);
    });

    // ── Renderizar galeria ────────────────────────────────────────────────────
    let namedCount = 0;
    const fragment = document.createDocumentFragment();

    images.forEach(filename => {
        if (!filename.match(/\.(png|jpe?g|webp|gif)$/i)) return;

        const id        = filename.substring(0, filename.lastIndexOf('.'));
        const displayId = !isNaN(id) && id.trim() !== '' ? parseInt(id, 10) : id;

        // Nome e tipo do item
        const itemName = (typeof itemNames !== 'undefined' && itemNames[displayId])
            ? itemNames[displayId]
            : null;
        const itemType = (typeof itemTypes !== 'undefined' && itemTypes[displayId] !== undefined)
            ? itemTypes[displayId]
            : null;

        if (itemName) namedCount++;

        const cardLabel  = itemName || `#${displayId}`;
        const tooltipHtml = itemName
            ? `<span class="tooltip-name">${itemName}</span><span class="tooltip-id">ID: ${displayId}</span>`
            : `<span class="tooltip-id">ID: ${displayId}</span>`;

        // Criar card
        const itemDiv = document.createElement('div');
        itemDiv.className    = 'gallery-item';
        itemDiv.dataset.id   = displayId;
        itemDiv.dataset.type = itemType !== null ? itemType : 'unknown';
        if (!itemName) itemDiv.classList.add('no-name');

        const img = document.createElement('img');
        img.src     = `img/${filename}`;
        img.alt     = itemName ? `${itemName} (ID: ${displayId})` : `Item ${displayId}`;
        img.loading = 'lazy';

        const nameLabel = document.createElement('span');
        nameLabel.className   = 'item-label';
        nameLabel.textContent = cardLabel;

        itemDiv.appendChild(img);
        itemDiv.appendChild(nameLabel);
        fragment.appendChild(itemDiv);

        // Tooltip
        itemDiv.addEventListener('mouseenter', () => {
            tooltip.innerHTML = tooltipHtml;
            tooltip.classList.remove('hidden');
        });
        itemDiv.addEventListener('mousemove', (e) => {
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top  = `${e.clientY + 15}px`;
        });
        itemDiv.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    });

    gallery.appendChild(fragment);
    updateCount('all');

    // ── Lógica de filtro ──────────────────────────────────────────────────────
    function applyFilter(categoryId) {
        if (categoryId === activeFilter) return;
        activeFilter = categoryId;

        const category  = CATEGORIES.find(c => c.id === categoryId);
        const allItems  = gallery.querySelectorAll('.gallery-item');
        const allBtns   = filterBar.querySelectorAll('.filter-btn');

        // Atualizar estado dos botões
        allBtns.forEach(btn => {
            const isActive = btn.dataset.filter === categoryId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Mostrar/ocultar cards
        allItems.forEach(item => {
            const type    = parseInt(item.dataset.type);
            const visible = category.types === null || category.types.includes(type);
            item.classList.toggle('filtered-out', !visible);
        });

        updateCount(categoryId);

        // Persistir filtro na URL (hash)
        history.replaceState(null, '', categoryId === 'all' ? ' ' : `#${categoryId}`);
    }

    function updateCount(categoryId) {
        const total   = gallery.querySelectorAll('.gallery-item').length;
        const visible = gallery.querySelectorAll('.gallery-item:not(.filtered-out)').length;
        if (categoryId === 'all') {
            imageCount.textContent = `${total} Itens  ·  ${namedCount} nomeados`;
        } else {
            const cat = CATEGORIES.find(c => c.id === categoryId);
            imageCount.textContent = `${visible} Itens  ·  ${cat.icon} ${cat.label}`;
        }
    }

    // ── Restaurar filtro da URL (hash) ────────────────────────────────────────
    const hashFilter = location.hash.replace('#', '');
    if (hashFilter && CATEGORIES.find(c => c.id === hashFilter)) {
        // Pequeno timeout para garantir que o DOM está pronto
        setTimeout(() => applyFilter(hashFilter), 0);
    }

    // ── Botão Voltar ao Topo ──────────────────────────────────────────────────
    window.addEventListener("scroll", () => {
        backToTopBtn.classList.toggle("hidden", window.scrollY <= 300);
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});
