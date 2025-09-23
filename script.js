let commands = [];
let activeCategory = "All";

async function loadCommands() {
  const res = await fetch("commands.json");
  commands = await res.json();
  renderTabs();
  renderCommands();
}

function renderTabs() {
  const categories = ["All", ...new Set(commands.map(c => c.category))];
  const tabsContainer = document.getElementById("tabs");
  tabsContainer.innerHTML = "";
  categories.forEach(cat => {
    const tab = document.createElement("div");
    tab.className = "tab" + (cat === activeCategory ? " active" : "");
    tab.textContent = cat;
    tab.onclick = () => {
      activeCategory = cat;
      renderTabs();
      renderCommands();
    };
    tabsContainer.appendChild(tab);
  });
}

function renderCommands() {
  const container = document.getElementById("commands-container");
  const searchInput = document.getElementById("search");
  const search = searchInput ? searchInput.value.toLowerCase() : "";

  container.innerHTML = "";
  commands
    .filter(c => (activeCategory === "All" || c.category === activeCategory))
    .filter(c =>
      (c.name && c.name.toLowerCase().includes(search)) ||
      (c.description && c.description.toLowerCase().includes(search))
    )
    .forEach(c => {
      const card = document.createElement("div");
      card.className = "command-card";
      card.style.position = "relative";

      // Permissions + tooltip
      if (c.permissions && c.permissions.length > 0) {
        const perm = document.createElement("div");
        perm.className = "permissions";
        perm.textContent = c.permissions.join(", ");

        const tooltip = document.createElement("div");
        tooltip.className = "permissions-tooltip";
        tooltip.textContent = "You must have this permission to use this command.";
        perm.appendChild(tooltip);

        card.appendChild(perm);
      }

      if (c.name) {
        const title = document.createElement("h3");
        title.textContent = c.name;
        card.appendChild(title);
      }

      if (c.description) {
        const desc = document.createElement("p");
        desc.textContent = c.description;
        card.appendChild(desc);
      }

      // Syntaxe (support tableau ou chaîne)
      if (c.syntax) {
  if (Array.isArray(c.syntax)) {
    c.syntax.forEach(syn => {
      const syntaxBlock = document.createElement("div");
      syntaxBlock.className = "syntax";
      syntaxBlock.style.marginBottom = "10px";
      syntaxBlock.style.display = "flex";
      syntaxBlock.style.alignItems = "center";
      syntaxBlock.style.justifyContent = "space-between";
      syntaxBlock.style.background = "#f8f8f8";
      syntaxBlock.style.borderRadius = "8px";
      syntaxBlock.style.padding = "8px 14px";

      const span = document.createElement("span");
      span.textContent = syn;
      span.style.color = "#232a36";
      span.style.fontWeight = "500";

      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-btn";
      copyBtn.textContent = "Copy";
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(syn);
        copyBtn.textContent = "✅";
        setTimeout(() => copyBtn.textContent = "Copy", 1000);
      };

      syntaxBlock.appendChild(span);
      syntaxBlock.appendChild(copyBtn);
      card.appendChild(syntaxBlock);
    });
  } else {
    const syntaxBlock = document.createElement("div");
    syntaxBlock.className = "syntax";
    syntaxBlock.style.display = "flex";
    syntaxBlock.style.alignItems = "center";
    syntaxBlock.style.justifyContent = "space-between";
    syntaxBlock.style.background = "#f8f8f8";
    syntaxBlock.style.borderRadius = "8px";
    syntaxBlock.style.padding = "8px 14px";
    syntaxBlock.style.marginBottom = "10px";

    const span = document.createElement("span");
    span.textContent = c.syntax;
    span.style.color = "#232a36";
    span.style.fontWeight = "500";

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(c.syntax);
      copyBtn.textContent = "✅";
      setTimeout(() => copyBtn.textContent = "Copy", 1000);
    };

    syntaxBlock.appendChild(span);
    syntaxBlock.appendChild(copyBtn);
    card.appendChild(syntaxBlock);
  }
}

      // Examples
      if (c.examples && c.examples.length > 0) {
        const ex = document.createElement("div");
        ex.className = "examples";
        ex.innerHTML = "<strong>Examples:</strong>" + c.examples.map(e => `<code>${e}</code>`).join("");
        card.appendChild(ex);
      }

      // Images miniatures + modal carrousel
      if (c.images && c.images.length > 0) {
        const imgContainer = document.createElement("div");
        imgContainer.className = "command-images";

        c.images.forEach((imgUrl, idx) => {
          const thumb = document.createElement("img");
          thumb.src = imgUrl;
          thumb.alt = (c.name || "image") + " " + (idx + 1);
          thumb.onclick = () => openImageModal(c.images, idx);
          imgContainer.appendChild(thumb);
        });

        card.appendChild(imgContainer);
      }

      container.appendChild(card);
    });
}

// Modal carrousel d'images
function openImageModal(images, startIndex) {
  let current = startIndex;

  // Crée le fond modal
  const modal = document.createElement("div");
  modal.className = "img-modal";

  // Contenu du modal
  const content = document.createElement("div");
  content.className = "img-modal-content";

  // Image affichée
  const img = document.createElement("img");
  img.className = "img-modal-img";
  img.src = images[current];

  // Bouton gauche
  const leftBtn = document.createElement("button");
  leftBtn.className = "img-modal-btn";
  leftBtn.innerHTML = "&#8592;";
  leftBtn.onclick = (e) => {
    e.stopPropagation();
    if (current > 0) {
      current--;
      img.src = images[current];
      updateBtns();
    }
  };

  // Bouton droit
  const rightBtn = document.createElement("button");
  rightBtn.className = "img-modal-btn";
  rightBtn.innerHTML = "&#8594;";
  rightBtn.onclick = (e) => {
    e.stopPropagation();
    if (current < images.length - 1) {
      current++;
      img.src = images[current];
      updateBtns();
    }
  };

  // Bouton fermer
  const closeBtn = document.createElement("button");
  closeBtn.className = "img-modal-close";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = (e) => {
    e.stopPropagation();
    document.body.removeChild(modal);
  };

  function updateBtns() {
    leftBtn.disabled = current === 0;
    rightBtn.disabled = current === images.length - 1;
  }
  updateBtns();

  content.appendChild(leftBtn);
  content.appendChild(img);
  content.appendChild(rightBtn);
  content.appendChild(closeBtn);
  modal.appendChild(content);

  // Fermer en cliquant sur le fond
  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };

  document.body.appendChild(modal);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search").addEventListener("input", renderCommands);
  loadCommands();
});