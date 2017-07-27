function resizeCards(){
    $(".home-card").css("height", $(window).height() - 50 + "px")
}

var homeMap = {};

$(document).ready(function(){
    this.resizeCards();
    this.homeMap = L.map('home-map',{
        center: [38.9517, -92.3341],
        zoom: 8,
        dragging: true,
        doubleClickZoom: false,
        zoomControl: true,
        scrollWheelZoom: false
    });

    var storyIcon = L.icon({
        iconUrl: '/static/marker-icon-red.png',
        iconSize: [28, 44] //38,57
    });

    L.tileLayer('http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
        maxZoom: 18
    }).addTo(this.homeMap);

    for (var i = 0, len = this.stories.length; i < len; i++) {
        story = stories[i];
        marker = L.marker([story.lat,story.long], {icon: storyIcon}).addTo(this.homeMap);

        marker.bindPopup('<a href="' + story.url + '"><h3>' + story.title + '</h3></a><p class="description">' +
            story.description + '</p><p class="readmore"><a href="'
            + story.url + '">Read More</a></p>');
    }
});
