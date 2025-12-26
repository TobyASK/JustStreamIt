// Fonctions pour créer les éléments d'interface

/**
 * Crée une carte film (cliquable pour ouvrir la modale)
 * @param {Object} movie - Objet film avec id, title, image_url, poster_url
 * @returns {HTMLElement} - Div col avec carte Bootstrap
 */
export function movieCard(movie) {
  const col = document.createElement("div");
  col.className = "col-6 col-md-3 col-lg-2"; // 2/4/6 colonnes selon la taille d'écran
  
  // Image placeholder (SVG gris) si l'image Amazon est introuvable
  const placeholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
  
  // Chercher l'URL de l'image (priorité: image_url > poster_url > placeholder)
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

/**
 * Vide le contenu d'un élément en supprimant tous les enfants
 * @param {HTMLElement} el - Élément à vider
 */
export function clear(el) {
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

/**
 * Gère l'affichage responsive des cartes avec logique "Voir plus/moins"
 * 
 * Logique:
 * - Affiche par défaut 2 (mobile) / 4 (tablette) / 6 (desktop) films
 * - "Voir plus" : ajoute defaultVisible films à la fois, peut charger depuis l'API
 * - "Voir moins" : retire defaultVisible films
 * - Les boutons disparaissent quand ce n'est plus possible
 * 
 * @param {HTMLElement} gridEl - Conteneur de films (grille)
 * @param {Function} fetchFn - Fonction optionnelle pour charger plus de films depuis l'API
 * @returns {Object} - Objet avec methods: more(), less(), getState(), updateForResize()
 */
export function applyVisibility(gridEl, fetchFn = null) {
  // Déterminer le nombre par défaut de films visibles selon le breakpoint
  const mqLg = window.matchMedia("(min-width: 992px)");
  const mqMd = window.matchMedia("(min-width: 768px)");

  const getDefaultVisible = () => mqLg.matches ? 6 : mqMd.matches ? 4 : 2;
  let defaultVisible = getDefaultVisible();
  let visible = Math.min(defaultVisible, gridEl.children.length);

  gridEl.dataset.defaultVisible = String(defaultVisible);

  /**
   * Applique la visibilité à toutes les cartes
   * Cache les cartes au-delà de l'index 'visible'
   */
  const apply = () => {
    const cards = [...gridEl.children];
    cards.forEach((c, i) => {
      c.style.display = i < visible ? '' : 'none';
    });
  };

  apply();

  return {
    /**
     * Affiche plus de films (ajoute defaultVisible à la fois)
     * - D'abord affiche les films DOM cachés
     * - Si tout est affiché, charge depuis l'API
     */
    more: async () => {
      const total = gridEl.children.length;
      
      // Cas 1: Des films sont cachés dans le DOM, les afficher
      if (visible < total) {
        visible = Math.min(visible + defaultVisible, total);
        apply();
      } 
      // Cas 2: Tous les films DOM sont visibles, charger depuis l'API
      else if (fetchFn && gridEl.dataset.hasMore !== 'false') {
        const { loadMoreFilms } = await import("./sections.js");
        const added = await loadMoreFilms(gridEl, defaultVisible);
        if (added > 0) {
          visible += added;
          apply();
        }
      }
    },

    /**
     * Masque des films (retire defaultVisible à la fois)
     * Ne descend jamais en-dessous du nombre par défaut
     */
    less: () => {
      visible = Math.max(visible - defaultVisible, defaultVisible);
      apply();
    },

    /**
     * Retourne l'état actuel pour mettre à jour l'UI des boutons
     * @returns {Object} {visible, total, defaultVisible, canShowMore, canShowLess}
     */
    getState: () => ({
      visible,
      total: gridEl.children.length,
      defaultVisible,
      // "Voir plus" visible si: total > défaut ET (des films cachés OU des pages à charger)
      canShowMore: gridEl.children.length > defaultVisible && (visible < gridEl.children.length || gridEl.dataset.hasMore !== 'false'),
      // "Voir moins" visible si: on a étendu au-delà du défaut
      canShowLess: visible > defaultVisible
    }),

    /**
     * Recalcule les valeurs lors d'un resize (changement de breakpoint)
     * Met à jour defaultVisible et réajuste visible si nécessaire
     */
    updateForResize: () => {
      defaultVisible = getDefaultVisible();
      gridEl.dataset.defaultVisible = String(defaultVisible);
      // Si on affiche moins que le nouveau défaut, ajuster
      if (visible <= defaultVisible) {
        visible = Math.min(defaultVisible, gridEl.children.length);
      }
      apply();
    },

    /**
     * Réinitialise la grille et recharge les données depuis l'API
     * Appelé quand le page_size change (changement de breakpoint)
     * Vide la grille, recharge la première page avec le nouveau page_size
     */
    resetAndReload: async () => {
      // Réinitialiser l'état
      defaultVisible = getDefaultVisible();
      gridEl.dataset.defaultVisible = String(defaultVisible);
      visible = defaultVisible;
      
      // Vider la grille et recharger depuis le fichier sections.js
      clear(gridEl);
      gridEl.dataset.currentPage = '1';
      gridEl.dataset.hasMore = 'true';
      
      // Le rechargement est géré par la fonction qui a créé ce handler
      // On déclenche juste un événement personnalisé que sections.js écoute
      gridEl.dispatchEvent(new CustomEvent('reload-data'));
    }
  };
}


