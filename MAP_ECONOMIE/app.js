const map = L.map('map', { zoomControl: false }).setView([39.82, 46.75], 8);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

let markers = [];
let allEvents = [];

async function init() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        allEvents = data.events;

        const slider = document.getElementById('year-slider');
        const display = document.getElementById('year-display');

        const refresh = (selectedYear) => {
            display.innerText = `Année : ${selectedYear}`;
            markers.forEach(m => map.removeLayer(m));
            markers = [];
            const list = document.getElementById('event-list');
            list.innerHTML = "";

            allEvents.forEach((ev, index) => {
                if (parseInt(ev.year) <= parseInt(selectedYear)) {
                    // Couleur selon le type d'événement
                    let color = "#f39c12"; // Orange par défaut
                    if (ev.type === 'BATAILLE' || ev.type === 'GUERRE') color = "#e74c3c"; // Rouge
                    if (ev.type === 'POLITIQUE') color = "#3498db"; // Bleu

                    // Marqueur sur la carte
                    const m = L.circleMarker(ev.coords, {
                        radius: 8,
                        fillColor: color,
                        color: "#fff",
                        weight: 1,
                        fillOpacity: 0.8
                    }).addTo(map);
                    
                    // Popup pointant vers details.html avec l'ID
                    m.bindPopup(`
                        <div style="text-align:center">
                            <b>${ev.title}</b><br>
                            <a href="details.html?id=${index}" style="color:#00a8ff; font-weight:bold; text-decoration:none;">Lire le récit →</a>
                        </div>
                    `);
                    markers.push(m);

                    // Carte dans la barre latérale
                    const card = document.createElement('div');
                    card.className = 'event-card';
                    // Style direct pour assurer la visibilité
                    card.style.borderLeft = `4px solid ${color}`;
                    card.style.background = (ev.year == selectedYear) ? "#1c2128" : "#21262d";
                    card.style.padding = "12px";
                    card.style.marginBottom = "10px";
                    card.style.borderRadius = "4px";
                    card.style.cursor = "pointer";

                    card.innerHTML = `
                        <small style="color:${color}; font-weight:bold;">${ev.type}</small>
                        <h6 style="margin:5px 0; color:white;">${ev.year} - ${ev.title}</h6>
                        <p style="font-size:12px; color:#aaa; margin-bottom:10px;">${ev.desc.substring(0, 80)}...</p>
                        <a href="details.html?id=${index}" style="font-size:11px; color:#00a8ff; text-decoration:none; font-weight:bold;">
                           <i class="fas fa-plus-circle"></i> VOIR LES DÉTAILS
                        </a>
                    `;
                    
                    card.onclick = (e) => {
                        // Si on ne clique pas sur le lien, on zoom sur la carte
                        if(e.target.tagName !== 'A') {
                            map.flyTo(ev.coords, 10);
                            m.openPopup();
                        }
                    };
                    list.prepend(card);
                }
            });
        };

        slider.addEventListener('input', (e) => refresh(e.target.value));
        refresh(slider.value); 

    } catch (error) {
        console.error("Erreur :", error);
    }
}

init();