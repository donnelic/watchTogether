const socket = io("https://your-vercel-backend.vercel.app");
        const video = document.getElementById('video');
        const urlInput = document.getElementById('m3u8Url');
        const title = document.getElementById('title');

        socket.on("updateVideo", (url) => {
            if (video.src !== url) {
                loadStream(url);
            }
        });

        socket.on("sync", ({ time, playing }) => {
            if (Math.abs(video.currentTime - time) > 0.5) {
                video.currentTime = time;
            }
            if (playing) {
                video.play();
            } else {
                video.pause();
            }
        });

        function setStream() {
            const url = urlInput.value;
            socket.emit("setVideo", url);
            loadStream(url);
            video.style.display = "block";
            title.style.display = "none";            
        }

        function loadStream(url) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.ERROR, function (event, data) {
                    if (data.fatal) {
                        switch (data.fatal) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                alert('Network error encountered while loading the video.');
                                break;
                            case Hls.ErrorTypes.OTHER_ERROR:
                                alert('An error occurred while loading the video.');
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            }
        }
        

        video.addEventListener("play", () => socket.emit("sync", { time: video.currentTime, playing: true }));
        video.addEventListener("pause", () => socket.emit("sync", { time: video.currentTime, playing: false }));
        video.addEventListener("seeked", () => socket.emit("sync", { time: video.currentTime, playing: !video.paused }));