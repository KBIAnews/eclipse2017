var playerElement = $('#story-player');
var audioUrl = playerElement.data('mp3-url');
var waveElement = $('#story-player .audio-player-wave');
var controlElement = $('#story-player .audio-player-controls');

var player = {
    position: 0,
    width: playerElement.width(),
    howlerSound: new Howl({
        src: [audioUrl],
        loop: false,
        html5: true,
        onload: function(){
            console.log(this.duration());
            player.audioLength = this.duration();
        }
    }),
    audioLength: 1000000000000,
    siriWave: new SiriWave({
        container: waveElement.get(0),
        width: waveElement.width(),
        height: waveElement.height(),
        color: '#333',
        frequency: 5,
        amplitude: 0.3,
        speed: 0.07
    }),
    updateInterval: {},
    play: function(){
        this.howlerSound.play();
        this.enablePositionUpdate();
        $('#story-player .audio-player-controls .audio-player-play').addClass('disabled');
        $('#story-player .audio-player-controls .audio-player-play').removeClass('enabled');
        $('#story-player .audio-player-controls .audio-player-pause').addClass('enabled');
        $('#story-player .audio-player-controls .audio-player-pause').removeClass('disabled');
        $('#story-player .audio-player-controls .audio-player-stop').addClass('enabled');
        $('#story-player .audio-player-controls .audio-player-stop').removeClass('disabled');
        this.siriWave.start();
    },
    pause: function(){
        this.howlerSound.pause();
        this.disablePositionUpdate();
        $('#story-player .audio-player-controls .audio-player-play').addClass('enabled');
        $('#story-player .audio-player-controls .audio-player-play').removeClass('disabled');
        $('#story-player .audio-player-controls .audio-player-pause').addClass('disabled');
        $('#story-player .audio-player-controls .audio-player-pause').removeClass('enabled');
        this.siriWave.stop();
    },
    stop: function(){
        this.howlerSound.stop();
        this.disablePositionUpdate();
        this.position = 0;
        $('#story-player .audio-player-controls .audio-player-play').addClass('enabled');
        $('#story-player .audio-player-controls .audio-player-play').removeClass('disabled');
        $('#story-player .audio-player-controls .audio-player-pause').addClass('disabled');
        $('#story-player .audio-player-controls .audio-player-pause').removeClass('enabled');
        $('#story-player .audio-player-controls .audio-player-stop').addClass('disabled');
        $('#story-player .audio-player-controls .audio-player-stop').removeClass('enabled');
        waveElement.removeClass(function (index, className) {
            return (className.match (/(^|\s)percent-fill-\S+/g) || []).join(' ');
        });
        waveElement.addClass('percent-fill-0');
        this.siriWave.stop();
    },
    enablePositionUpdate: function(){
        this.updateInterval = setInterval(function(){
            player.position += 1;
        }, 1000);
    },
    disablePositionUpdate: function(){
        clearInterval(this.updateInterval);
    }
};

$('#story-player .audio-player-controls .audio-player-play').on('click',function(){
    player.play();
});

$('#story-player .audio-player-controls .audio-player-pause').on('click', function(){
    player.pause();
})

$('#story-player .audio-player-controls .audio-player-stop').on('click',function(){
    player.stop();
});

player.siriWave.start();
player.siriWave.stop();

var statusPoller = setInterval(function(){
    percentComplete = Math.round((player.position/player.audioLength)*100);
    // console.log(percentComplete);
    waveElement.addClass('percent-fill-'+percentComplete);
    waveElement.removeClass('percent-fill-' + (percentComplete-1));
}, 500);
