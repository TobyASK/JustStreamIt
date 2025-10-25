// Fonctions pour créer les éléments d'interface

// Crée une carte film (cliquable pour ouvrir la modale)
export function movieCard(movie) {
  const col = document.createElement("div");
  col.className = "col-6 col-md-3 col-lg-2"; // 2/4/6 colonnes selon la taille d'écran
  
  // Image placeholder si l'image Amazon est introuvable
  const placeholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
  
  let imgSrc = placeholder;
  if (movie.image_url && String(movie.image_url).trim() !== "") {
    imgSrc = movie.image_url;
  } else if (movie.poster_url && String(movie.poster_url).trim() !== "") {
    imgSrc = movie.poster_url;
  }
  
  const title = movie.title || "Film sans titre";

  col.innerHTML = `
    <div class="card h-100" data-open-details data-movie-id="${movie.id}">
      <img src="${imgSrc}" class="card-img-top" alt="${title}" 
           onerror="this.onerror=null; this.src='${placeholder}';" />
      <div class="card-body d-flex flex-column">
        <h3 class="card-title" data-open-details data-movie-id="${movie.id}">${title}</h3>
        <button class="btn btn-primary btn-sm btn-details mt-auto" data-open-details data-movie-id="${movie.id}">Détails</button>
      </div>
    </div>`;
  
  return col;
}

// Vide le contenu d'un élément
export function clear(el) {
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

// Gère l'affichage responsive des cartes (2/4/6 selon la taille d'écran)
// Retourne une fonction pour le bouton "Voir plus/moins"
export function applyVisibility(gridEl, fetchFn = null) {
  const mqLg = window.matchMedia("(min-width: 992px)");
  const mqMd = window.matchMedia("(min-width: 768px)");

  const defaultVisible = mqLg.matches ? 6 : mqMd.matches ? 4 : 2;
  let visible = Math.min(defaultVisible, gridEl.children.length);

  gridEl.dataset.defaultVisible = String(defaultVisible);
  gridEl.dataset.visible = String(visible);
  gridEl.dataset.expanded = "false";

  const apply = () => {
    const cards = [...gridEl.children];
    cards.forEach((c, i) => {
      if (i < visible) {
        c.style.display = '';
      } else {
        c.style.display = 'none';
      }
    });
    gridEl.dataset.visible = String(visible);
  };

  apply();

  // Fonction pour afficher plus ou moins de films
  return {
    more: async () => {
      const currentCards = gridEl.children.length;
      const hasMore = gridEl.dataset.hasMore !== 'false';
      
      // Si on a déjà assez de cartes cachées, les révéler
      if (visible < currentCards) {
        visible = Math.min(visible + 6, currentCards);
        apply();
      }
      // Sinon, charger plus de films depuis l'API si disponible
      else if (hasMore && fetchFn) {
        const { loadMoreFilms } = await import("./sections.js");
        const added = await loadMoreFilms(gridEl, 6);
        if (added > 0) {
          visible += added;
          apply();
        }
      }
    },
    less: () => {
      const defaultVis = parseInt(gridEl.dataset.defaultVisible) || defaultVisible;
      visible = Math.max(visible - 6, defaultVis);
      apply();
    },
    getState: () => {
      const currentCards = gridEl.children.length;
      const hasMore = gridEl.dataset.hasMore !== 'false';
      
      return {
        visible,
        total: currentCards,
        defaultVisible: parseInt(gridEl.dataset.defaultVisible) || defaultVisible,
        canShowMore: visible < currentCards || hasMore,
        canShowLess: visible > (parseInt(gridEl.dataset.defaultVisible) || defaultVisible)
      };
    }
  };
}


