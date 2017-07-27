/**
 * Created by nathanlawrence on 7/27/17.
 */

var mapzen_api_key = 'mapzen-AEaxs5f';


$(document).ready(function(){

});

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

        $('.app-body').append(html);
    });
};