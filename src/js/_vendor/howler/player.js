/*!
 *  Howler.js Audio Player Demo
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

// Cache references to DOM elements.
var elms = ['track', 'timer', 'duration', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'playlistBtn', 'volumeBtn', 'progress', 'startbar', 'wave', 'loading', 'playlist', 'list', 'volume', 'barEmpty', 'barFull', 'sliderBtn'];

var tempAudio = new Audio();

elms.forEach(function (elm) {
    window[elm] = document.getElementById(elm);
});

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function (playlist) {
    this.playlist = playlist;
    this.index = 0;

    // Display the title of the first track.
    track.innerHTML = '1. ' + playlist[0].title;

    // Setup the playlist display.
    playlist.forEach(function (song) {
        var div = document.createElement('div');
        div.className = 'list-song';
        div.innerHTML = song.title;
        // div.onclick = function () {
        //     player.skipTo(playlist.indexOf(song));
        // };
        list.appendChild(div);
    });
};
Player.prototype = {

    // load: function (idx, playNow = false) {
    //     let index = typeof idx === 'number' ? idx : self.index;
    //     if (index < 0) return;
    //     if (!self.playlist[index]) {
    //         index = 0;
    //     }

    //     if (self.index !== index) Howler.stop();
    //     const data = self.playlist[index];

    //     if (!data.howl || !this._media_uri_list[data.id]) {
    //         this.retrieveMediaUrl(index, playNow);
    //     } else {
    //         this.finishLoad(index, playNow);
    //     }
    // },

    isPlaying: function (audioEl) {
        console.log(audioEl);
        return !audioEl.paused;
    },
    /**
     * Play a song in the playlist.
     * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
     */
    play: function (index) {
        var self = this;
        var sound;

        index = typeof index === 'number' ? index : self.index;
        // index = typeof index === 0 ? index : self.index;
        var data = self.playlist[index];
        // If we already loaded this track, use the current one.
        // Otherwise, setup and load a new Howl.
        if (data.howl) {
            console.log('already loaded howl');
            console.log('tempAudio is playing?');
            console.log(self.isPlaying(tempAudio));
            if (self.isPlaying(tempAudio)) {
                tempAudio.pause();
            }
            console.log('sound is playing?');
            console.log(self);
            if (sound) {
                self.pause();
            }
            sound = data.howl;
            console.log("data.howl:", data.howl);
            sound.play();
        } else {
            console.log('load a new Howl');
            var fileSrc;

            fileSrc = data.file;
            console.log("fileSrc:", fileSrc);

            sound = data.howl = new Howl({
                src: fileSrc,
                html5: true,
                onplay: function () {
                    // Display the duration.
                    duration.innerHTML = self.formatTime(Math.round(sound.duration()));

                    // Start updating the progress of the track.
                    requestAnimationFrame(self.step.bind(self));

                    // Start the wave animation if we have already loaded
                    // wave.container.style.display = 'block';
                    playBtn.style.display = 'none';
                    startbar.style.display = 'none';
                    pauseBtn.style.display = 'block';
                },
                onload: function () {
                    // console.log('howl load');
                    // Start the wave animation.
                    // wave.container.style.display = 'block';
                    startbar.style.display = 'none';
                    loading.style.display = 'none';
                },
                onend: function () {
                    // console.log('howl onend');
                    // Stop the wave animation.
                    // wave.container.style.display = 'none';
                    startbar.style.display = 'flex';

                    playBtn.style.display = 'block';
                    pauseBtn.style.display = 'none';
                    // self.skip('next');
                },
                onpause: function () {
                    // console.log('howl onpause');
                    // Stop the wave animation.
                    // wave.container.style.display = 'none';
                    startbar.style.display = 'flex';
                },
                onstop: function () {
                    // console.log('howl onstop');
                    // Stop the wave animation.
                    // // wave.container.style.display = 'none';
                    startbar.style.display = 'flex';
                },
                onseek: function () {
                    // console.log('howl onseek');
                    // Start updating the progress of the track.
                    requestAnimationFrame(self.step.bind(self));
                }
            });
            if (tempAudio.innerHTML === '') {
                console.log(1);
                tempAudio.innerHTML = '<source src="' + fileSrc + '" type="audio/ogg" />';
                tempAudio.play();
            } else {
                console.log(2);
                tempAudio.pause();
                tempAudio.src = fileSrc;
                tempAudio.load();
                tempAudio.play();
            }
        }

        // console.log(sound);
        // Begin playing the sound.

        // Update the track display.
        track.innerHTML = (index + 1) + '. ' + data.title;

        // Show the pause button.
        if (sound.state() === 'loaded') {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'block';
        } else {
            loading.style.display = 'block';
            playBtn.style.display = 'none';
            // pauseBtn.style.display = 'none';
            pauseBtn.style.display = 'block';
        }

        // Keep track of the index we are currently playing.
        self.index = index;
    },

    /**
     * Pause the currently playing track.
     */
    pause: function () {
        var self = this;
        console.log('player pause');
        console.log(self.isPlaying(tempAudio));
        if (self.isPlaying(tempAudio)) {
            tempAudio.pause();
        }

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        if (sound) {
            sound.pause();
        }
        // Puase the sound.

        // Show the play button.
        playBtn.style.display = 'block';
        pauseBtn.style.display = 'none';
    },

    /**
     * Skip to the next or previous track.
     * @param  {String} direction 'next' or 'prev'.
     */
    skip: function (direction) {
        var self = this;
        console.log('player skip');
        if (self.isPlaying(tempAudio)) {
            tempAudio.pause();
        }

        // Get the next track based on the direction of the track.
        var index = 0;
        if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
                index = self.playlist.length - 1;
            }
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = 0;
            }
        }

        self.skipTo(index);
    },

    /**
     * Skip to a specific track based on its playlist index.
     * @param  {Number} index Index in the playlist.
     */
    skipTo: function (index) {
        var self = this;
        console.log('player skipTo');

        console.log(self.isPlaying(tempAudio));
        if (self.isPlaying(tempAudio)) {
            tempAudio.pause();
        }

        // Stop the current track.
        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }

        // Reset progress.
        progress.style.width = '0%';

        // Play the new track.
        self.play(index);
    },

    /**
     * Set the volume and update the volume slider display.
     * @param  {Number} val Volume between 0 and 1.
     */
    volume: function (val) {
        var self = this;

        // Update the global volume (affecting all Howls).
        Howler.volume(val);

        // Update the display on the slider.
        var barWidth = (val * 90) / 100;
        barFull.style.width = (barWidth * 100) + '%';

        // sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
    },

    /**
     * Seek to a new position in the currently playing track.
     * @param  {Number} per Percentage through the song to skip.
     */
    seek: function (per) {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        // Convert the percent into a seek position.
        if (sound.playing()) {
            sound.seek(sound.duration() * per);
        }
    },

    /**
     * The step called within requestAnimationFrame to update the playback position.
     */
    step: function () {
        var self = this;

        // Get the Howl we want to manipulate.
        var sound = self.playlist[self.index].howl;

        // Determine our current seek position.
        var seek = sound.seek() || 0;
        timer.innerHTML = self.formatTime(Math.round(seek));
        progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

        // If the sound is still playing, continue stepping.
        if (sound.playing()) {
            requestAnimationFrame(self.step.bind(self));
        }
    },

    /**
     * Toggle the playlist display on/off.
     */
    togglePlaylist: function () {
        var self = this;
        var display = (playlist.style.display === 'block') ? 'none' : 'block';

        setTimeout(function () {
            playlist.style.display = display;
        }, (display === 'block') ? 0 : 500);
        playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
    },

    /**
     * Toggle the volume display on/off.
     */
    toggleVolume: function () {
        var self = this;
        var display = (volume.style.display === 'block') ? 'none' : 'block';

        setTimeout(function () {
            volume.style.display = display;
        }, (display === 'block') ? 0 : 500);
        volume.className = (display === 'block') ? 'fadein' : 'fadeout';
    },

    /**
     * Format the time from seconds to M:SS.
     * @param  {Number} secs Seconds to format.
     * @return {String}      Formatted time.
     */
    formatTime: function (secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = (secs - minutes * 60) || 0;

        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    }
};
