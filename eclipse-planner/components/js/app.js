/**
 * Created by nathanlawrence on 7/27/17.
 */

var mapzen_api_key = 'mapzen-AEaxs5f';

var map = {};


$(document).ready(function(){
    $('.locationSearch').submit(function(event){
       event.preventDefault();

       checkLocation(event);
    });
    loadMap();
});


function loadMap(){
    map = L.map('background-map',{
        center: [38.9517, -92.3341],
        zoom: 5,
        dragging: true,
        doubleClickZoom: false,
        zoomControl: false,
        scrollWheelZoom: false
    });

    L.tileLayer('https://api.mapbox.com/styles/v1/nathanlawrence/cj5a0sy4o6g7a2sql4g6si2dy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmF0aGFubGF3cmVuY2UiLCJhIjoiY2l5dzl5NDA4MDAxeTJxcWU3NTVwaHBsMyJ9.kNUj23zWfRJNLl2W8hsAyA', {
        maxZoom: 18
    }).addTo(map);
};

function checkLocation(event) {
    var searchText = $('#location-search').val();
    d3.json(`https://search.mapzen.com/v1/search?text=${searchText}&api_key=${mapzen_api_key}`, function (d) {

        let loc = d.features[0];

        let location = {
            long: loc.geometry.coordinates[0],
            lat: loc.geometry.coordinates[1],
            label: loc.properties.label,
            confidence: loc.properties.confidence
        };

        let eclipseCirc = loc_circ_obj(location.lat, location.long);

        let html = `<h1>Results for ${location.label}</h1>` +
            `<p>Confidence: ${location.confidence}</p>` +
            `<p>${eclipseCirc.displayEclipseType}</p>`;

        map.flyTo([location.lat, location.long], 8);

        $('.app-body').append(html);
    });
};