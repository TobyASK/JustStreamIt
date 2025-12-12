// ============================================================
// ui.js - FICHIER QUI CRÉE LES ÉLÉMENTS VISUELS (DOM)
// ============================================================
// Ce fichier contient les fonctions qui créent et manipulent
// les éléments HTML de la page (cartes de films, visibilité, etc.)
// ============================================================

// ------------------------------------------------------------
// FONCTION : movieCard - Créer une carte de film
// ------------------------------------------------------------
// Rôle : Crée l'élément HTML d'une carte de film
// Paramètre : movie = objet contenant les infos du film
// Retourne : un élément HTML <div> avec la carte complète
//
// "export" = cette fonction peut être utilisée dans d'autres fichiers
export function movieCard(movie) {
  // Crée un élément <div> qui servira de conteneur
  // document.createElement() crée un nouvel élément HTML
  const col = document.createElement("div");
  
  // Ajoute les classes CSS Bootstrap pour le responsive :
  // - col-6 : 2 cartes par ligne sur mobile (6/12 = 50%)
  // - col-md-3 : 4 cartes par ligne sur tablette (3/12 = 25%)
  // - col-lg-2 : 6 cartes par ligne sur desktop (2/12 = 16.6%)
  col.className = "col-6 col-md-3 col-lg-2";
  
  // Image par défaut si l'image du film n'existe pas
  // C'est une image SVG encodée en base64 (texte "Image non disponible")
  const placeholder = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIj48cmVjdCBmaWxsPSIjZGRkIiB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIvPjx0ZXh0IGZpbGw9IiM5OTkiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiB4PSI1MCUiIHk9IjUwJSIgZHk9Ii4zZW0iIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vbiBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg==";
  
  // Détermine quelle image utiliser
  let imgSrc = placeholder; // Par défaut : image placeholder
  
  // Si le film a une image_url valide, on l'utilise
  // String().trim() enlève les espaces avant/après
  if (movie.image_url && String(movie.image_url).trim() !== "") {
    imgSrc = movie.image_url;
  } 
  // Sinon, si le film a une poster_url valide, on l'utilise
  else if (movie.poster_url && String(movie.poster_url).trim() !== "") {
    imgSrc = movie.poster_url;
  }
  
  // Récupère le titre du film, ou "Film sans titre" si pas de titre
  // L'opérateur || signifie "ou" : si movie.title est vide/null, utilise le texte après
  const title = movie.title || "Film sans titre";

  // innerHTML = définit le contenu HTML de l'élément
  // Les backticks (``) permettent d'écrire du HTML sur plusieurs lignes
  // et d'insérer des variables avec ${variable}
  col.innerHTML = `
    <div class="card h-100" data-open-details data-movie-id="${movie.id}">
      <img src="${imgSrc}" class="card-img-top" alt="${title}" 
           onerror="this.onerror=null; this.src='${placeholder}';" />
      <div class="card-body d-flex flex-column">
        <h3 class="card-title" data-open-details data-movie-id="${movie.id}">${title}</h3>
        <button class="btn btn-primary btn-sm btn-details mt-auto" data-open-details data-movie-id="${movie.id}">Détails</button>
      </div>
    </div>`;
  
  // EXPLICATIONS DU HTML CI-DESSUS :
  // - data-open-details : attribut personnalisé qui indique "cet élément ouvre les détails"
  // - data-movie-id : stocke l'ID du film pour savoir lequel ouvrir
  // - onerror : si l'image ne charge pas, remplace par le placeholder
  // - h-100 : hauteur 100% (Bootstrap)
  // - d-flex flex-column : disposition en colonne (Bootstrap)
  // - mt-auto : marge en haut automatique, pousse le bouton en bas (Bootstrap)
  
  // Retourne l'élément créé
  return col;
}

// ------------------------------------------------------------
// FONCTION : clear - Vider un élément HTML
// ------------------------------------------------------------
// Rôle : Supprime tous les enfants d'un élément (le vide)
// Paramètre : el = l'élément HTML à vider
//
// Utilisée avant de remplir une grille avec de nouveaux films
export function clear(el) {
  // Tant que l'élément a un premier enfant...
  while(el.firstChild) {
    // ...on le supprime
    el.removeChild(el.firstChild);
  }
  // À la fin, l'élément est vide
}

// ------------------------------------------------------------
// FONCTION : applyVisibility - Gérer "Voir plus/moins"
// ------------------------------------------------------------
// Rôle : Contrôle combien de cartes sont visibles dans une grille
// Paramètres :
//   - gridEl : l'élément grille contenant les cartes
//   - fetchFn : fonction pour charger plus de films (optionnel)
// Retourne : un objet avec les méthodes more(), less(), getState()
//
// Cette fonction utilise le pattern "closure" : elle retourne
// des fonctions qui gardent accès aux variables locales
export function applyVisibility(gridEl, fetchFn = null) {
  // Détecte la taille de l'écran avec matchMedia
  // C'est comme les @media queries en CSS, mais en JavaScript
  const mqLg = window.matchMedia("(min-width: 992px)"); // Grand écran (desktop)
  const mqMd = window.matchMedia("(min-width: 768px)"); // Moyen écran (tablette)

  // Calcule combien de cartes afficher par défaut selon l'écran :
  // - Desktop (>992px) : 6 cartes
  // - Tablette (>768px) : 4 cartes
  // - Mobile : 2 cartes
  // L'opérateur ternaire (condition ? valeurSiVrai : valeurSiFaux) est un if/else raccourci
  const defaultVisible = mqLg.matches ? 6 : mqMd.matches ? 4 : 2;
  
  // Nombre de cartes actuellement visibles
  // Math.min() retourne le plus petit des deux nombres
  // (on ne peut pas afficher plus de cartes qu'il n'y en a)
  let visible = Math.min(defaultVisible, gridEl.children.length);

  // Stocke ces valeurs dans les attributs data- de l'élément HTML
  // dataset permet d'accéder aux attributs data-* en JavaScript
  // String() convertit le nombre en texte
  gridEl.dataset.defaultVisible = String(defaultVisible);
  gridEl.dataset.visible = String(visible);
  gridEl.dataset.expanded = "false";

  // ------------------------------------------------------------
  // FONCTION INTERNE : apply
  // ------------------------------------------------------------
  // Rôle : Applique la visibilité (cache/affiche les cartes)
  const apply = () => {
    // [...gridEl.children] transforme la collection d'enfants en tableau
    // Les 3 points (...) s'appellent "spread operator"
    // Cela permet d'utiliser forEach() qui n'existe que sur les tableaux
    const cards = [...gridEl.children];
    
    // Pour chaque carte (c) à l'index (i)...
    // forEach() exécute une fonction pour chaque élément
    cards.forEach((c, i) => {
      if (i < visible) {
        // Si l'index est inférieur au nombre visible : afficher
        c.style.display = '';  // Chaîne vide = display par défaut (visible)
      } else {
        // Sinon : cacher la carte
        c.style.display = 'none';
      }
    });
    
    // Met à jour l'attribut data-visible dans le HTML
    gridEl.dataset.visible = String(visible);
  };

  // Applique la visibilité une première fois au chargement
  apply();

  // ------------------------------------------------------------
  // RETOUR : Objet avec 3 méthodes
  // ------------------------------------------------------------
  // On retourne un objet contenant 3 fonctions
  // C'est le "pattern module révélateur" (Revealing Module Pattern)
  // Ces fonctions gardent accès à "visible" grâce à la "closure"
  return {
    // --------------------------------------------------------
    // MÉTHODE : more - Afficher plus de cartes
    // --------------------------------------------------------
    // async car on peut avoir besoin de charger depuis l'API
    more: async () => {
      // Nombre total de cartes actuellement dans la grille
      const currentCards = gridEl.children.length;
      
      // Vérifie s'il y a encore des films à charger depuis l'API
      // hasMore est false seulement si data-has-more vaut exactement "false"
      const hasMore = gridEl.dataset.hasMore !== 'false';
      
      // CAS 1 : On a des cartes cachées dans la grille, on les révèle
      if (visible < currentCards) {
        // Augmente le nombre visible de 6 (sans dépasser le total)
        visible = Math.min(visible + 6, currentCards);
        apply(); // Applique le changement
      }
      // CAS 2 : Toutes les cartes sont visibles, on en charge de nouvelles
      else if (hasMore && fetchFn) {
        // import() dynamique : charge le module sections.js à la demande
        // C'est utile pour éviter les dépendances circulaires
        const { loadMoreFilms } = await import("./sections.js");
        
        // Charge 6 nouveaux films depuis l'API
        const added = await loadMoreFilms(gridEl, 6);
        
        // Si des films ont été ajoutés, on les rend visibles
        if (added > 0) {
          visible += added;
          apply();
        }
      }
    },
    
    // --------------------------------------------------------
    // MÉTHODE : less - Afficher moins de cartes
    // --------------------------------------------------------
    less: () => {
      // Récupère le nombre par défaut depuis l'attribut data-
      // parseInt() convertit le texte en nombre
      // || defaultVisible = valeur de secours si parseInt échoue
      const defaultVis = parseInt(gridEl.dataset.defaultVisible) || defaultVisible;
      
      // Diminue le nombre visible de 6 (sans descendre sous le minimum)
      // Math.max() retourne le plus grand des deux nombres
      visible = Math.max(visible - 6, defaultVis);
      apply(); // Applique le changement
    },
    
    // --------------------------------------------------------
    // MÉTHODE : getState - Obtenir l'état actuel
    // --------------------------------------------------------
    // Utilisée par les boutons pour savoir s'ils doivent s'afficher
    getState: () => {
      const currentCards = gridEl.children.length;
      const hasMore = gridEl.dataset.hasMore !== 'false';
      
      // Retourne un objet avec toutes les infos sur l'état
      return {
        visible,                    // Nombre de cartes actuellement visibles
        total: currentCards,        // Nombre total de cartes dans la grille
        defaultVisible: parseInt(gridEl.dataset.defaultVisible) || defaultVisible,
        canShowMore: visible < currentCards || hasMore,  // true si on peut afficher plus
        canShowLess: visible > (parseInt(gridEl.dataset.defaultVisible) || defaultVisible)  // true si on peut réduire
      };
    }
  };
}


