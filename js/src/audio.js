//Much of this code is from an open git repo
//I applied several optimizations, as well as added gainNode [volume control]
//and enabled knockout functionality
//Most of my interaction with this file has been largely trimming the fat

/*
 * @param, optional user-selected song choice via knockout dropdown
 */

var Audio = function(passedUrl, array, boost){
    var context, sourceJs, analyser, buffer, source,
        url = passedUrl || './data/Amon-Tobin_Surge.mp3';

    try {
        if(typeof webkitAudioContext === 'function') {
            context = new webkitAudioContext();
        }
        else {
            context = new AudioContext();
        }
    }
    catch(e) {
        $('#info').text('Web Audio API is not supported in this browser');
    }

    var request = new XMLHttpRequest();
        request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
        var $play_link = $('#play_link'),
            $play = $('#play'),
            $info = $('#info');

        /* @params decodeAudioData
         * audioData; ArrayBuffer containing audio file data
         * successCallback; invoked on successful decoding
         * errorCallback
         */
        context.decodeAudioData(
            request.response,
            function(buffer) {
                if(!buffer) {
                    $info.text('Error decoding file data');
                    return;
                }

                sourceJs = context.createJavaScriptNode(2048);
                sourceJs.buffer = buffer;
                sourceJs.connect(context.destination);
                analyser = context.createAnalyser();
                analyser.smoothingTimeConstant = 0.6;
                analyser.fftSize = 512;

                source = context.createBufferSource();

                /*
                 *  WebAudio volume control
                 */
                gainNode = context.createGainNode();
                source.connect(gainNode);
                gainNode.connect(context.destination);

                /*
                 * WebAudio modular routing
                 * @source creates AudioBuffer, zero-initialized
                 * @buffer is media input
                 *
                 */
                source.buffer = buffer;
                source.loop = true;

                source.connect(analyser);
                analyser.connect(sourceJs);
                source.connect(context.destination);

                sourceJs.onaudioprocess = function(e) {
                    array = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(array);
                    boost = 0;
                    for (var i = 0; i < array.length; i++) {
                        boost += array[i];
                    }
                    boost = boost / array.length;
                    render(null, array, boost);
                };

                // popup
                $('body').append($('<div onclick="play('+source+');" id="play" style="width: ' +
                                 $(window).width() + 'px; height: ' + $(window).height() +
                                 'px;"><div id="play_link"></div></div>'));
                var $play_link = $('#play_link'),
                    $play = $('#play');
                $play_link.css('top', ($(window).height() / 2 - $play_link.height() / 2) + 'px');
                $play_link.css('left', ($(window).width() / 2 - $play_link.width() / 2) + 'px');
                $play.fadeIn();
            },
            function(error) {
                $info.text('Decoding error:' + error);
            }
        );
    };

    request.onerror = function(e) {
        debugger;
        $('#info').text(''+e+'buffer: XHR error');
    };

    request.send();

    $(window).resize(function() {
        var $play_link = $('#play_link'),
            $play = $('#play');
        if($play.length === 1) {
            $play.width($(window).width());
            $play.height($(window).height());

            if($play_link.length === 1) {
                $play_link.css('top', ($(window).height() / 2 - $play_link.height() / 2) + 'px');
                $play_link.css('left', ($(window).width() / 2 - $play_link.width() / 2) + 'px');
            }
        }
    });
};