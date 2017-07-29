/**
 * Created by nathanlawrence on 7/27/17.
 */

var mapzen_api_key = 'mapzen-AEaxs5f';

var tz_api_key = 'AIzaSyAkMigHh0ygs873s_iGIk_3ScAt-0tW_fY';

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

    //@TODO uncomment when deploying
    L.tileLayer('https://api.mapbox.com/styles/v1/nathanlawrence/cj5a0sy4o6g7a2sql4g6si2dy/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmF0aGFubGF3cmVuY2UiLCJhIjoiY2l5dzl5NDA4MDAxeTJxcWU3NTVwaHBsMyJ9.kNUj23zWfRJNLl2W8hsAyA', {
        maxZoom: 18
    }).addTo(map);
};

function checkLocation(event) {
    var searchText = improveLocationInput($('#location-search').val());
    d3.json(`https://search.mapzen.com/v1/search?text=${searchText}&api_key=${mapzen_api_key}`, function (d) {

        let loc = d.features[0];
        console.log(d.features[0]);

        let location = {
            long: loc.geometry.coordinates[0],
            lat: loc.geometry.coordinates[1],
            label: loc.properties.label,
            confidence: loc.properties.confidence
        };

        eclipseAtLoc(location);
    });
}

function resetMap(){
    map.flyTo([38.9517, -96], 5);
}

function resetApp(){
    $('#location-search').val('');
    $('#app-front')
        .addClass('anim-show')
        .removeClass('anim-hide');
    $('#app-result')
        .addClass('anim-hide')
        .removeClass('anim-show');
    resetMap();
}

function toMoment(c){
    let mom = moment.tz(`${c.date} ${c.time.split('.')[0]}`, 'YYYY/MM/DD HH:mm:ss', 'Etc/UTC');
    mom = mom.tz(moment.tz.guess());
    return mom;
}

function eclipseAtLoc(location){
    let eclipseCirc = loc_circ_obj(location.lat, location.long);

    console.log(eclipseCirc);

    let html = '';

    if (eclipseCirc.isEclipse){

        var eclipseStart = toMoment(eclipseCirc.c1);
        var eclipseEnd = toMoment(eclipseCirc.c4);

        console.log(eclipseStart);

        if (eclipseCirc.partialEvent){
            html = `<p>Near <strong>${location.label}</strong>, ` +
                `we think you'll probably experience a <strong>partial solar eclipse</strong>. ` +
                `This means some of the sun will remain visible, but you'll still experience ` +
                `some darkness and a shift in color as the moon passes the sun.` +
                `</p><p>` +
                `Your eclipse will start at <strong>${eclipseStart.format('LT zz')}</strong> and end at <strong>${eclipseEnd.format('LT zz')}</strong>. ` +
                `</p><div id="quadratic"></div>`;
        }
        else{
            let totalEclipseStart = toMoment(eclipseCirc.c2);
            let totalEclipseEnd = toMoment(eclipseCirc.c3);
            html = `<p>Near <strong>${location.label}</strong>, ` +
                `we think you'll probably experience a <strong>total solar eclipse</strong>. ` +
                ` This means that for about <strong>${eclipseCirc.duration}</strong>, you'll be in total darkness ` +
                `as the moon passes in front of the sun.` +
                `</p><p>` +
                `Your eclipse will start at <strong>${eclipseStart.format('LT zz')}</strong> and end at <strong>${eclipseEnd.format('LT zz')}</strong>. ` +
                    `You'll probably lose the sun completely at around <strong>${totalEclipseStart.format('LT zz')}</strong>, ` +
                `but we recommend getting ready at least 10-15 minutes early for maximum enjoyment. ` +
                `Here's a timeline to help you visualize the eclipse's progress:` +
                `</p><div id="quadratic"></div>`;

        }




    }
    else{
        html = `<p>Near <strong>${location.label}</strong>, ` +
            `we don't think you'll see much of an eclipse this time.</p>`
    }

    html += '<a class="button" href="#" onClick="resetApp()">Go Back</a>'


    map.flyTo([location.lat, location.long], 8);

    $('#app-front')
        .addClass('anim-hide')
        .removeClass('anim-show');
    $('#app-result')
        .html(html)
        .addClass('anim-show')
        .removeClass('anim-hide');

    addChart(eclipseCirc, eclipseStart, eclipseEnd);
}

function addChart(eclipse, eclipseStart, eclipseEnd){

    var eclipseDuration = eclipseEnd.diff(eclipseStart, 'minutes', true);
    console.log(eclipseDuration);

    console.log(eclipse);

    var maxCoverage = eclipse.coverage.split('%')[0];
    var co = [];

    if (eclipse.partialEvent){
        co = quadraticCoeFromThree([0, 0], [eclipseDuration/2, maxCoverage], [eclipseDuration, 0]);
    }
    else {
        let c2 = toMoment(eclipse.c2).diff(eclipseStart, 'minutes', true);
        let c3 = toMoment(eclipse.c3).diff(eclipseStart, 'minutes', true);

        co = quadraticCoeFromThree([0,0], [c2, 100], [c3, 100]);
    }

    let width = d3.select("div#quadratic")
        .style("width").split("p")[0];
    let height = 60;

    console.log(width);

    let xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, eclipseDuration]);

    let yScale = d3.scaleLinear()
        .range([0, height])
        .domain([0, 120]);

    let data = d3.range(0, eclipseDuration)
        .map(function(d){
            return {
                x: d,
                y: quadratic(co, d)
            }
        });

    var line = d3.line()
        .x(function (d) {return xScale(d.x);})
        .y(function (d) {return yScale(d.y);})
        .curve(d3.curveBasis);

    var xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(function(d){
            return `${d} min`;
        });

    var svg = d3.select("div#quadratic")
        .append("svg")
        .attr("width", width)
        .attr("height", height + 20);

    svg.append('path')
        .datum(data)
        .attr('d', line);

    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.selectAll(".tick text").each(function (d) {
        var tick = d3.select(this);
        if (d == 0){
            tick.style("visibility", "hidden");
        }
    });
}

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

function improveLocationInput(val){
    let query = val.toLowerCase();
    switch (query){
        case 'como':
            val = 'Columbia, Missouri';
            break;
        case 'columbia':
            val = 'Columbia, Missouri';
            break;
        case 'stl':
            val = 'St. Louis, Missouri';
            break;
        case 'st louis':
            val = 'St. Louis, Missouri';
            break;
        case 'kansas city':
            val = 'Kansas City, Missouri';
            break;
        case 'kc':
            val = 'Kansas City, Missouri';
            break;
        default:
            break;
    }
    return val;
}

