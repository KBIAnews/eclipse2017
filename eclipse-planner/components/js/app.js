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
    testQuad();
});


function loadMap(){
    map = L.map('background-map',{
        center: [38.9517, -96],
        zoom: 5,
        dragging: false,
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

        $('#app-front')
            .addClass('anim-hide')
            .removeClass('anim-show');
        $('#app-result')
            .append(html)
            .addClass('anim-show')
            .removeClass('anim-hide');
    });
};

function quadraticCoeFromThree(d,e,f){
    var x_1 = d[0],
        y_1 = d[1],
        x_2 = e[0],
        y_2 = e[1],
        x_3 = f[0],
        y_3 = f[1];

    var arr = [];


    // Coefficient a
    arr.push(
        ((x_3)*(y_2- y_1) + x_2*(y_1 - y_3) + x_1*(y_3 - y_2))/
        ((x_1 - x_2) * (x_1 - x_3) * (x_2 - x_3))
    );

    // Coefficient b
    arr.push(
        ((Math.pow(x_1, 2)*(y_2-y_3))+(Math.pow(x_3, 2)*(y_1-y_2))+(Math.pow(x_2, 2)*(y_3-y_1)))/
        ((x_1 - x_2)*(x_1-x_3)*(x_2-x_3))
    );

    // Coefficient c
    arr.push(
        ((Math.pow(x_2, 2)*(x_3*y_1 - x_1*y_3)) + x_2*(Math.pow(x_1, 2)*y_3 - Math.pow(x_3, 2)*y_1) + (x_1*x_3*(x_3 - x_1)*(y_2)))/
        ((x_1 - x_2)*(x_1 - x_3)*(x_2-x_3))
    );

    return arr;
}

function quadratic(co, x){
    return (co[0] * Math.pow(x, 2) + x*co[1] + co[2]);
}

function testQuad(){
    var co = quadraticCoeFromThree([3,3],[6,12],[9,27]);
    console.log(co);
    console.log(quadratic(co,9));
}