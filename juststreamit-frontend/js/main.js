// Point d'entrée de l'application JustStreamIt
// Gère le chargement initial et les événements

import { renderBest, renderTop, renderCategory, initOthers } from "./sections.js";
import { fetchDetails } from "./api.js";

// Handlers pour les boutons "Voir plus/moins"
let showMoreTop, showMoreCat1, showMoreCat2, showMoreOthers;

// Ouvre la modale avec les détails d'un film
async function openDetails(id) {
  try {
    const data = await fetchDetails(id);
    
    // Remplir le titre de la modale
    document.getElementById("detailsModalLabel").textContent = data.title || "Détails du film";
    
    // Remplir le contenu de la modale avec toutes les informations
    const modalContent = document.getElementById("modal-content");
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
    
    // Ouvrir la modale Bootstrap 5
    const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
    modal.show();
  } catch (error) {
    console.error("Erreur lors du chargement des détails:", error);
    alert("Erreur lors du chargement des détails du film");
  }
}

/**
 * Délégation d'événements pour les clics sur les éléments "Détails"
 * Écoute les clics au niveau du document pour gérer dynamiquement
 * tous les éléments avec data-open-details (cartes, boutons, titres)
 * 
 * @param {HTMLElement} root - Élément racine où attacher l'écouteur (par défaut document)
 */
function delegateDetailsClicks(root = document) {
  root.addEventListener("click", (e) => {
    // Trouver l'élément cliqué portant l'attribut data-open-details
    const btn = e.target.closest("[data-open-details]");
    if (btn) {
      const id = btn.getAttribute("data-movie-id");
      if (id) {
        openDetails(id);
      }
    }
  });
}

/**
 * Connecte les boutons "Voir plus" de chaque section à leurs handlers respectifs
 * Gère aussi le changement de label "Voir plus" ↔ "Voir moins"
 */
function wireMoreButtons() {
  /**
   * Met à jour le texte du bouton selon l'état de la grille (étendu ou réduit)
   * @param {string} btnId - ID du bouton
   * @param {string} gridId - ID de la grille correspondante
   */
  const updateLabel = (btnId, gridId) => {
    const btn = document.getElementById(btnId);
    const grid = document.getElementById(gridId);
    if (!btn || !grid) return;
    const expanded = grid.dataset.expanded === "true";
    btn.textContent = expanded ? "Voir moins" : "Voir plus";
  };

  /**
   * Lie un bouton à sa grille et son handler
   * @param {string} btnId - ID du bouton
   * @param {string} gridId - ID de la grille
   * @param {Function} handlerGetter - Fonction retournant le handler showMore
   */
  const bind = (btnId, gridId, handlerGetter) => {
    const btn = document.getElementById(btnId);
    btn.onclick = () => {
      const handler = handlerGetter();
      if (handler) handler(2); // Révéler 2 cartes supplémentaires à chaque clic
      updateLabel(btnId, gridId);
    };
  };

  // Connecter les 4 boutons "Voir plus" à leurs grilles respectives
  bind("btn-show-more-top", "top-rated-grid", () => showMoreTop);
  bind("btn-show-more-cat1", "category-1-grid", () => showMoreCat1);
  bind("btn-show-more-cat2", "category-2-grid", () => showMoreCat2);
  bind("btn-show-more-others", "others-grid", () => showMoreOthers);
  
  // Masquer les boutons pour les sections sans films ou avec moins de films que le seuil
  ["top-rated-grid", "category-1-grid", "category-2-grid", "others-grid"].forEach((gridId, idx) => {
    const grid = document.getElementById(gridId);
    const btnIds = ["btn-show-more-top", "btn-show-more-cat1", "btn-show-more-cat2", "btn-show-more-others"];
    const btn = document.getElementById(btnIds[idx]);
    if (!grid || !btn) return;
    
    // Masquer si: section vide, erreur, ou nombre de films ≤ seuil par défaut
    const hasError = grid.querySelector('.text-muted, .text-danger');
    const totalCards = parseInt(grid.dataset.total || "0", 10);
    const defaultVisible = parseInt(grid.dataset.defaultVisible || "6", 10);
    
    if (hasError || grid.children.length === 0 || totalCards <= defaultVisible) {
      btn.style.display = "none";
    } else {
      btn.style.display = "";
    }
  });
}

/**
 * Gère le redimensionnement de la fenêtre (responsive)
 * Recalcule la visibilité 2/4/6 selon le nouveau breakpoint
 * en respectant l'état étendu/réduit de chaque section
 */
function handleResize() {
  window.addEventListener("resize", () => {
    const grids = [
      "top-rated-grid",
      "category-1-grid",
      "category-2-grid",
      "others-grid"
    ];
    
    grids.forEach(gridId => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      
      const cards = [...grid.children];
      const mqLg = window.matchMedia("(min-width: 992px)");
      const mqMd = window.matchMedia("(min-width: 768px)");
      
      // Recalculer le nombre par défaut selon le nouveau breakpoint
      const defaultVisible = mqLg.matches ? 6 : mqMd.matches ? 4 : 2;
      const expanded = grid.dataset.expanded === "true";
      
      // Si étendu, garder tout visible; sinon, appliquer le nouveau défaut (limité au total)
      const visible = expanded ? cards.length : Math.min(defaultVisible, cards.length);
      grid.dataset.defaultVisible = String(defaultVisible);
      grid.dataset.visible = String(visible);
      
      cards.forEach((c, i) => {
        if (i < visible) {
          c.style.opacity = '1';
          c.style.pointerEvents = 'auto';
          c.style.position = 'relative';
        } else {
          c.style.opacity = '0';
          c.style.pointerEvents = 'none';
          c.style.position = 'absolute';
          c.style.left = '-9999px';
        }
      });
    });
  });
}

/**
 * Fonction d'initialisation principale de l'application
 * Exécutée au chargement de la page (module ES6)
 * 
 * Séquence:
 * 1. Activer la délégation des clics pour la modale
 * 2. Charger la liste des genres pour "Autres"
 * 3. Remplir toutes les sections (Meilleur, Top, Cat1, Cat2, Autres)
 * 4. Connecter les boutons "Voir plus"
 * 5. Gérer le changement de genre dans "Autres"
 * 6. Activer la gestion du resize
 */
async function main() {
  try {
    // 1. Délégation des clics pour ouvrir la modale
    delegateDetailsClicks();
    
    // 2. Initialiser la liste déroulante des genres
    await initOthers();
    
    // Genres fixes pour les catégories 1 et 2
    const genre1 = "Mystery";
    const genre2 = "Drama";
    
    // Genre initial pour "Autres" (premier de la liste)
    const select = document.getElementById("genre-select");
    const initialOthers = select.options[0]?.value || "Action";
    
    // 3. Remplir toutes les sections en parallèle et récupérer les handlers
    await renderBest();
    showMoreTop = await renderTop();
    showMoreCat1 = await renderCategory("category-1", genre1);
    showMoreCat2 = await renderCategory("category-2", genre2);
    showMoreOthers = await renderCategory("others", initialOthers);
    
    // 4. Connecter les boutons "Voir plus/moins"
    wireMoreButtons();
    
    // 5. Gérer le changement de genre dans la section "Autres"
    select.addEventListener("change", async () => {
      const selectedGenre = select.value;
      if (selectedGenre) {
        // Afficher un indicateur de chargement
        const othersGrid = document.getElementById("others-grid");
        othersGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Chargement...</span></div></div>';
        
        // Recharger la grille avec le nouveau genre
        showMoreOthers = await renderCategory("others", selectedGenre);
        
        // Réinitialiser le bouton à "Voir plus"
        const btn = document.getElementById("btn-show-more-others");
        if (btn) {
          const grid = document.getElementById("others-grid");
          if (!grid) return;
          
          // Masquer le bouton si: erreur, vide, ou nombre de films ≤ seuil
          const hasError = grid.querySelector('.text-muted, .text-danger');
          const totalCards = parseInt(grid.dataset.total || "0", 10);
          const defaultVisible = parseInt(grid.dataset.defaultVisible || "6", 10);
          
          if (hasError || grid.children.length === 0 || totalCards <= defaultVisible) {
            btn.style.display = "none";
          } else {
            btn.style.display = "";
            btn.textContent = "Voir plus";
          }
        }
      }
    });
    
    // 6. Activer la gestion du redimensionnement
    handleResize();
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);
  }
}

// Lancement de l'application au chargement du module
main();

