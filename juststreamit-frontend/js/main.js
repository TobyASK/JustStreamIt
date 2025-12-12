// ============================================================
// main.js - POINT D'ENTRÉE DE L'APPLICATION (Chef d'orchestre)
// ============================================================
// Ce fichier est le premier à s'exécuter. Il :
// 1. Initialise toutes les sections de la page
// 2. Gère les clics sur les boutons "Détails"
// 3. Gère les boutons "Voir plus/moins"
// 4. Gère le changement de genre dans "Autres"
// ============================================================

// ------------------------------------------------------------
// IMPORTS - Fonctions des autres fichiers
// ------------------------------------------------------------
// On importe les fonctions nécessaires depuis les autres modules
import { renderBest, renderTop, renderCategory, initOthers } from "./sections.js";
import { fetchDetails } from "./api.js";

// ------------------------------------------------------------
// VARIABLES GLOBALES
// ------------------------------------------------------------
// Ces variables stockent les "handlers" (gestionnaires) des boutons "Voir plus/moins"
// "let" permet de modifier la variable plus tard (contrairement à "const")
// Au début, elles sont "undefined" (pas encore définies)
let showMoreTop, showMoreCat1, showMoreCat2, showMoreOthers;

// ------------------------------------------------------------
// FONCTION : openDetails - Ouvrir la modale avec les détails d'un film
// ------------------------------------------------------------
// Rôle : Affiche une fenêtre popup avec toutes les infos d'un film
// Paramètre : id = l'identifiant du film à afficher
// Appelée quand on clique sur "Détails" ou sur une carte
async function openDetails(id) {
  try {
    // Récupère les données du film depuis l'API
    const data = await fetchDetails(id);
    
    // Met à jour le titre de la modale (en haut de la popup)
    // textContent = définit le texte d'un élément
    document.getElementById("detailsModalLabel").textContent = data.title || "Détails du film";
    
    // Récupère l'élément où afficher le contenu
    const modalContent = document.getElementById("modal-content");
    
    // Crée le HTML avec toutes les informations du film
    // Array.isArray() vérifie si c'est un tableau
    // .join(", ") transforme un tableau en chaîne avec des virgules
    // Ex: ["Action", "Drama"] devient "Action, Drama"
    modalContent.innerHTML = `
      <div class="row g-3">
        <div class="col-md-4">
          <img src="${data.image_url || ""}" alt="${data.title || ""}" class="img-fluid rounded" onerror="this.src='https://via.placeholder.com/300x450?text=No+Image'" />
        </div>
        <div class="col-md-8">
          <div class="mb-2">
            <span class="info-label">Genres :</span>
            <span class="info-value">${Array.isArray(data.genres) ? data.genres.join(", ") : (data.genres || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Date de sortie :</span>
            <span class="info-value">${data.date_published || "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Classification :</span>
            <span class="info-value">${data.rated || "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Score IMDB :</span>
            <span class="info-value">${data.imdb_score !== null && data.imdb_score !== undefined ? data.imdb_score + "/10" : "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Réalisateur(s) :</span>
            <span class="info-value">${Array.isArray(data.directors) ? data.directors.join(", ") : (data.directors || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Acteurs :</span>
            <span class="info-value">${Array.isArray(data.actors) ? data.actors.join(", ") : (data.actors || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Durée :</span>
            <span class="info-value">${data.duration ? data.duration + " min" : "N/A"}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Pays :</span>
            <span class="info-value">${Array.isArray(data.countries) ? data.countries.join(", ") : (data.countries || "N/A")}</span>
          </div>
          <div class="mb-2">
            <span class="info-label">Box-office :</span>
            <span class="info-value">${data.worldwide_gross_income || data.usa_gross_income || "N/A"}</span>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-2">
            <span class="info-label">Résumé :</span>
          </div>
          <p class="info-value">${data.long_description || data.description || "Aucun résumé disponible."}</p>
        </div>
      </div>
    `;
    
    // Ouvre la modale en utilisant l'API JavaScript de Bootstrap 5
    // "new bootstrap.Modal()" crée une instance de modale
    // .show() l'affiche à l'écran
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
    
  } catch (error) {
    // En cas d'erreur, affiche dans la console et alerte l'utilisateur
    console.error("Erreur lors du chargement des détails:", error);
    alert("Erreur lors du chargement des détails du film");
  }
}

// ------------------------------------------------------------
// FONCTION : delegateDetailsClicks - Délégation d'événements
// ------------------------------------------------------------
// Rôle : Écoute TOUS les clics sur la page et ouvre la modale si nécessaire
// 
// POURQUOI "DÉLÉGATION" ?
// Au lieu de mettre un écouteur sur chaque carte (100+ écouteurs),
// on met UN SEUL écouteur sur le document qui capture tous les clics.
// C'est plus performant et ça fonctionne même pour les cartes ajoutées après.
//
// Paramètre : root = où écouter les clics (par défaut : tout le document)
function delegateDetailsClicks(root = document) {
  // addEventListener() ajoute un écouteur d'événements
  // "click" = on écoute les clics
  // (e) => { ... } = fonction à exécuter quand un clic se produit
  // "e" est l'objet Event qui contient les infos sur le clic
  root.addEventListener("click", (e) => {
    // e.target = l'élément exact qui a été cliqué
    // .closest() remonte dans les parents pour trouver l'élément qui a l'attribut
    // "[data-open-details]" = sélecteur CSS pour les éléments avec cet attribut
    const btn = e.target.closest("[data-open-details]");
    
    // Si on a trouvé un élément avec data-open-details...
    if (btn) {
      // Récupère l'ID du film depuis l'attribut data-movie-id
      const id = btn.getAttribute("data-movie-id");
      
      // Si l'ID existe, ouvre les détails
      if (id) {
        openDetails(id);
      }
    }
  });
}

// ------------------------------------------------------------
// FONCTION : wireMoreButtons - Connecter les boutons Voir plus/moins
// ------------------------------------------------------------
// Rôle : Associe chaque paire de boutons (plus/moins) à sa grille
// Cette fonction utilise une "closure" pour créer des connexions réutilisables
function wireMoreButtons() {
  // ------------------------------------------------------------
  // FONCTION INTERNE : bindPair
  // ------------------------------------------------------------
  // Rôle : Connecte une paire de boutons (plus/moins) à une grille
  // Paramètres :
  //   - moreId : ID du bouton "Voir plus"
  //   - lessId : ID du bouton "Voir moins"
  //   - gridId : ID de la grille de films
  //   - handlerGetter : fonction qui retourne le handler actuel
  //
  // "handlerGetter" est une fonction car le handler peut changer
  // (quand on change de genre dans "Autres", le handler est recréé)
  const bindPair = (moreId, lessId, gridId, handlerGetter) => {
    // Récupère les éléments HTML
    const btnMore = document.getElementById(moreId);
    const btnLess = document.getElementById(lessId);
    const grid = document.getElementById(gridId);
    
    // Si un élément n'existe pas, on arrête
    if (!btnMore || !btnLess || !grid) return;
    
    // Fonction pour mettre à jour l'affichage des boutons
    const updateButtons = () => {
      // Récupère le handler actuel
      const handler = handlerGetter();
      if (!handler) return;
      
      // Récupère l'état (combien de films visibles, etc.)
      const state = handler.getState();
      
      // Affiche/cache le bouton "Voir plus"
      // Si canShowMore est true : affiche, sinon cache
      btnMore.style.display = state.canShowMore ? "inline-block" : "none";
      
      // Affiche/cache le bouton "Voir moins"
      btnLess.style.display = state.canShowLess ? "inline-block" : "none";
    };
    
    // Clic sur "Voir plus"
    // onclick = définit ce qui se passe quand on clique
    btnMore.onclick = async () => {
      const handler = handlerGetter();
      if (handler) {
        await handler.more();  // Affiche plus de cartes
        updateButtons();       // Met à jour les boutons
      }
    };
    
    // Clic sur "Voir moins"
    btnLess.onclick = () => {
      const handler = handlerGetter();
      if (handler) {
        handler.less();    // Cache des cartes
        updateButtons();   // Met à jour les boutons
      }
    };
    
    // Met à jour les boutons au démarrage
    updateButtons();
  };

  // Connecte les 4 paires de boutons aux 4 grilles
  // () => showMoreTop est une "arrow function" qui retourne la valeur actuelle
  bindPair("btn-show-more-top", "btn-show-less-top", "top-rated-grid", () => showMoreTop);
  bindPair("btn-show-more-cat1", "btn-show-less-cat1", "category-1-grid", () => showMoreCat1);
  bindPair("btn-show-more-cat2", "btn-show-less-cat2", "category-2-grid", () => showMoreCat2);
  bindPair("btn-show-more-others", "btn-show-less-others", "others-grid", () => showMoreOthers);
}

// ------------------------------------------------------------
// FONCTION : handleResize - Gérer le redimensionnement
// ------------------------------------------------------------
// Rôle : Quand la fenêtre change de taille, recalcule l'affichage
// Ex: Passer de desktop (6 cartes) à mobile (2 cartes)
function handleResize() {
  // Ajoute un écouteur sur l'événement "resize" (redimensionnement)
  window.addEventListener("resize", () => {
    // Liste des grilles à mettre à jour
    const grids = [
      "top-rated-grid",
      "category-1-grid",
      "category-2-grid",
      "others-grid"
    ];
    
    // Pour chaque grille...
    grids.forEach(gridId => {
      const grid = document.getElementById(gridId);
      if (!grid) return;  // Si la grille n'existe pas, passe à la suivante
      
      // Récupère toutes les cartes
      const cards = [...grid.children];
      
      // Détecte la taille de l'écran
      const mqLg = window.matchMedia("(min-width: 992px)");
      const mqMd = window.matchMedia("(min-width: 768px)");
      
      // Calcule le nouveau nombre par défaut
      const defaultVisible = mqLg.matches ? 6 : mqMd.matches ? 4 : 2;
      
      // Vérifie si la grille était "étendue" (Voir plus cliqué)
      const expanded = grid.dataset.expanded === "true";
      
      // Si étendu : montre tout, sinon applique le nouveau défaut
      const visible = expanded ? cards.length : Math.min(defaultVisible, cards.length);
      
      // Met à jour les attributs data-
      grid.dataset.defaultVisible = String(defaultVisible);
      grid.dataset.visible = String(visible);
      
      // Applique la visibilité à chaque carte
      cards.forEach((c, i) => {
        if (i < visible) {
          // Carte visible
          c.style.opacity = '1';
          c.style.pointerEvents = 'auto';
          c.style.position = 'relative';
        } else {
          // Carte cachée (déplacée hors écran)
          c.style.opacity = '0';
          c.style.pointerEvents = 'none';
          c.style.position = 'absolute';
          c.style.left = '-9999px';
        }
      });
    });
  });
}

// ------------------------------------------------------------
// FONCTION : main - Fonction principale d'initialisation
// ------------------------------------------------------------
// Rôle : Lance l'application au chargement de la page
// C'est la fonction qui coordonne tout le démarrage
//
// SÉQUENCE D'EXÉCUTION :
// 1. Active la détection des clics pour la modale
// 2. Charge les genres pour le dropdown "Autres"
// 3. Remplit toutes les sections avec des films
// 4. Connecte les boutons "Voir plus/moins"
// 5. Configure le changement de genre dans "Autres"
// 6. Active la gestion du redimensionnement
async function main() {
  try {
    // ========== ÉTAPE 1 ==========
    // Active la délégation des clics pour ouvrir la modale
    // À partir de maintenant, tout clic sur data-open-details ouvrira la modale
    delegateDetailsClicks();
    
    // ========== ÉTAPE 2 ==========
    // Initialise la liste déroulante des genres
    // Remplit le <select> avec tous les genres disponibles
    await initOthers();
    
    // ========== CONFIGURATION ==========
    // Genres fixes pour les catégories 1 et 2
    // Tu peux les changer ici si tu veux d'autres genres
    const genre1 = "Mystery";
    const genre2 = "Drama";
    
    // Récupère le premier genre de la liste pour "Autres"
    const select = document.getElementById("genre-select");
    // options[0] = première option du select
    // ?.value = valeur si elle existe, sinon undefined
    // || "Action" = valeur par défaut si undefined
    const initialOthers = select.options[0]?.value || "Action";
    
    // ========== ÉTAPE 3 ==========
    // Remplit toutes les sections et récupère les handlers
    
    // Affiche le meilleur film en haut
    await renderBest();
    
    // Affiche les films les mieux notés et stocke le handler
    showMoreTop = await renderTop();
    
    // Affiche les films Mystery et stocke le handler
    showMoreCat1 = await renderCategory("category-1", genre1);
    
    // Affiche les films Drama et stocke le handler
    showMoreCat2 = await renderCategory("category-2", genre2);
    
    // Affiche les films du premier genre (Autres) et stocke le handler
    showMoreOthers = await renderCategory("others", initialOthers);
    
    // ========== ÉTAPE 4 ==========
    // Connecte les boutons "Voir plus/moins" aux grilles
    wireMoreButtons();
    
    // ========== ÉTAPE 5 ==========
    // Écoute les changements dans le dropdown "Autres"
    // Quand l'utilisateur choisit un nouveau genre...
    select.addEventListener("change", async () => {
      // Récupère le genre sélectionné
      const selectedGenre = select.value;
      
      if (selectedGenre) {
        // Affiche un spinner de chargement
        const othersGrid = document.getElementById("others-grid");
        othersGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
        
        // Recharge la grille avec le nouveau genre
        // Le nouveau handler remplace l'ancien
        showMoreOthers = await renderCategory("others", selectedGenre);
        
        // Met à jour l'affichage du bouton "Voir plus"
        const btn = document.getElementById("btn-show-more-others");
        if (btn) {
          const grid = document.getElementById("others-grid");
          if (!grid) return;
          
          // Vérifie s'il y a une erreur ou si la grille est vide
          const hasError = grid.querySelector('.text-muted, .text-danger');
          const totalCards = parseInt(grid.dataset.total || "0", 10);
          const defaultVisible = parseInt(grid.dataset.defaultVisible || "6", 10);
          
          // Cache le bouton si erreur, vide, ou pas assez de films
          if (hasError || grid.children.length === 0 || totalCards <= defaultVisible) {
            btn.style.display = "none";
          } else {
            btn.style.display = "";
            btn.textContent = "Voir plus";
          }
        }
      }
    });
    
    // ========== ÉTAPE 6 ==========
    // Active la gestion du redimensionnement de la fenêtre
    handleResize();
    
  } catch (error) {
    // En cas d'erreur globale, l'affiche dans la console
    console.error("Erreur lors de l'initialisation:", error);
  }
}

// ============================================================
// DÉMARRAGE DE L'APPLICATION
// ============================================================
// Appelle la fonction main() pour lancer l'application
// Cette ligne s'exécute automatiquement quand le fichier est chargé
// (car c'est un module ES6 avec type="module" dans le HTML)
main();

