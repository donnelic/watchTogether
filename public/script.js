const socket = io('https://watch-together-iota.vercel.app/api/socket')

socket.on('connect', () => {
  console.log('Socket connected')
})

// Add other socket event listeners as needed

const video = document.getElementById('video')
const urlInput = document.getElementById('m3u8Url')
const title = document.getElementById('title')

socket.on('updateVideo', url => {
  if (video.src !== url) {
    loadStream(url)
  }
})

socket.on('sync', ({ time, playing }) => {
  if (Math.abs(video.currentTime - time) > 0.5) {
    video.currentTime = time
  }
  if (playing) {
    video.play()
  } else {
    video.pause()
  }
})

function setStream () {
  const url = urlInput.value
  socket.emit('setVideo', url)
  loadStream(url)
  video.style.display = 'block'
  title.style.display = 'none'
}

function loadStream(url) {
  const video = document.getElementById('your-video-element-id'); // Replace with your actual video element ID

  // Fetch the .m3u8 file
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.text(); // Get the text content of the response
    })
    .then(m3u8Content => {
      // Create a blob URL for the .m3u8 content
      const blob = new Blob([m3u8Content], { type: 'application/x-mpegURL' });
      const blobURL = URL.createObjectURL(blob);

      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(blobURL); // Load the blob URL
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

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play(); // Play the video when the manifest is parsed
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = blobURL; // For browsers that support HLS natively
        video.addEventListener('loadedmetadata', function () {
          video.play(); // Play the video when metadata is loaded
        });
      } else {
        alert('HLS is not supported in your browser.');
      }
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

video.addEventListener('play', () =>
  socket.emit('sync', { time: video.currentTime, playing: true })
)
video.addEventListener('pause', () =>
  socket.emit('sync', { time: video.currentTime, playing: false })
)
video.addEventListener('seeked', () =>
  socket.emit('sync', { time: video.currentTime, playing: !video.paused })
)
