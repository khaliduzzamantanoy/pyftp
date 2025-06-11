document.addEventListener("DOMContentLoaded", () => {
  const moviesContainer = document.getElementById("movies-container");
  const searchInput = document.getElementById("search-input");
  const isAdminPage = window.location.pathname.startsWith("/admin");

  if (!moviesContainer || !searchInput) return;

  // Inject video player popup if not present
  if (!document.getElementById("video-player-popup")) {
    const playerPopup = document.createElement("div");
    playerPopup.id = "video-player-popup";
    playerPopup.className = "video-player-popup";
    playerPopup.style.display = "none";
    playerPopup.innerHTML = `
      <div class="video-player-container">
        <video id="video-player" playsinline webkit-playsinline preload="metadata"></video>

        <div class="video-loading-overlay" id="video-loading-overlay">
          <div class="video-loading-spinner"></div>
        </div>
        <input type="range" id="progress-bar" min="0" max="100" value="0" step="0.1" aria-label="Seek bar" />
        <div class="video-controls">
          <button id="btn-backward" title="Back 10s" aria-label="Back 10 seconds" type="button" class="control-icon" aria-pressed="false" tabindex="0" role="button" aria-live="polite" aria-atomic="true" aria-relevant="additions removals"> 
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 19V5l-7 7 7 7zM18 19V5h-2v14h2z"/></svg>
          </button>
          <button id="btn-play-pause" title="Play/Pause" aria-label="Play/Pause" type="button" aria-pressed="false" tabindex="0" role="button">
            <svg id="play-pause-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z"/>
            </svg>
            
          </button>
          <button id="btn-forward" title="Forward 10s" aria-label="Forward 10 seconds" type="button" class="control-icon" aria-pressed="false" tabindex="0" role="button" aria-live="polite" aria-atomic="true" aria-relevant="additions removals">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 5v14l7-7-7-7zM5 19V5h2v14H5z"/></svg>
          </button>
          <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="1" title="Volume" aria-label="Volume slider" />
          <select id="audio-track-select" title="Audio Track" aria-label="Audio Track" style="display:none;"></select>
          <button id="btn-fullscreen" title="Fullscreen" aria-label="Fullscreen" type="button" aria-pressed="false" tabindex="0" role="button">⛶</button>
          <button id="btn-close" title="Close Player" aria-label="Close Player" type="button" aria-pressed="false" tabindex="0" role="button">✖</button>
        </div>
      </div>
    `;
    document.body.appendChild(playerPopup);
  }

  // Elements
  const popup = document.getElementById("video-player-popup");
  const video = document.getElementById("video-player");
  const loadingOverlay = document.getElementById("video-loading-overlay");
  const progressBar = document.getElementById("progress-bar");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const btnPlayPause = document.getElementById("btn-play-pause");
  const btnBackward = document.getElementById("btn-backward");
  const btnForward = document.getElementById("btn-forward");
  const volumeSlider = document.getElementById("volume-slider");
  const btnFullscreen = document.getElementById("btn-fullscreen");
  const audioSelect = document.getElementById("audio-track-select");
  const videoContainer = document.querySelector(".video-player-container");
  const btnClose = document.getElementById("btn-close");

  // Show/hide loading spinner
  function showLoading() {
    loadingOverlay.classList.add("visible");
  }
  function hideLoading() {
    loadingOverlay.classList.remove("visible");
  }

  // Update play/pause icon SVG path
  function updatePlayPauseIcon() {
    if (video.paused) {
      playPauseIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`; // Play icon
      btnPlayPause.setAttribute("aria-pressed", "false");
    } else {
      playPauseIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`; // Pause icon
      btnPlayPause.setAttribute("aria-pressed", "true");
    }
  }

  function openVideoPlayer(movieId) {
    const extensions = ["mp4", "webm", "mkv"]; // add more if needed
    let tried = 0;

    function tryPlay(ext) {
      const src = `/static/movies/${movieId}/movie.${ext}`;
      video.src = src;
      video.load();
      video.play().catch(() => {
        tried++;
        if (tried < extensions.length) {
          tryPlay(extensions[tried]);
        } else {
          alert("Video format not supported or file not found.");
        }
      });
    }

    tryPlay(extensions[0]);

    updatePlayPauseIcon();
    popup.style.display = "flex";
    audioSelect.style.display = "none";
    audioSelect.innerHTML = "";
    showLoading();

    video.onloadedmetadata = () => {
      const tracks = video.audioTracks;
      if (tracks && tracks.length > 0) {
        audioSelect.style.display = "inline-block";
        audioSelect.innerHTML = "";
        for (let i = 0; i < tracks.length; i++) {
          const option = document.createElement("option");
          option.value = i;
          option.text = `Audio Track ${i + 1}`;
          audioSelect.appendChild(option);
        }
        for (let i = 0; i < tracks.length; i++) {
          tracks[i].enabled = i === 0;
        }
      } else {
        audioSelect.style.display = "none";
        audioSelect.innerHTML = "";
      }
      hideLoading();
    };
  }

  // Event listeners for video buffering
  video.addEventListener("waiting", showLoading);
  video.addEventListener("playing", hideLoading);
  video.addEventListener("canplay", hideLoading);
  video.addEventListener("seeked", hideLoading);
  video.addEventListener("stalled", showLoading);
  video.addEventListener("error", hideLoading);

  // Update progress bar as video plays
  video.ontimeupdate = () => {
    if (video.duration) {
      progressBar.value = (video.currentTime / video.duration) * 100;
    }
    updatePlayPauseIcon();
  };
  // Seek video when progress bar changes
  progressBar.oninput = () => {
    if (video.duration) {
      video.currentTime = (progressBar.value / 100) * video.duration;
    }
  };

  video.onplay = updatePlayPauseIcon;
  video.onpause = updatePlayPauseIcon;

  // Button controls
  btnPlayPause.onclick = () => {
    if (video.paused) video.play();
    else video.pause();
  };
  btnBackward.onclick = () => {
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };
  btnForward.onclick = () => {
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };
  volumeSlider.oninput = (e) => {
    video.volume = e.target.value;
  };

  btnFullscreen.onclick = () => {
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Exit fullscreen failed:", err);
      });
    }
  };
  let controlsTimeout;

  function showControls() {
    videoControls.style.opacity = "1";
    videoControls.style.pointerEvents = "auto";
    resetControlsTimeout();
  }

  function hideControls() {
    videoControls.style.opacity = "0";
    videoControls.style.pointerEvents = "none";
  }

  function resetControlsTimeout() {
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (document.fullscreenElement && isMobileDevice()) {
        hideControls();
      }
    }, 3000);
  }

  function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  const videoControls = document.querySelector(".video-controls");

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      showControls();
    } else {
      videoControls.style.opacity = "1";
      videoControls.style.pointerEvents = "auto";
      clearTimeout(controlsTimeout);
    }
  });

  popup.addEventListener("touchstart", showControls);
  popup.addEventListener("mousemove", showControls);
  popup.addEventListener("click", showControls);

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      btnFullscreen.textContent = "[↘]"; // exit fullscreen icon
      btnFullscreen.title = "Exit Fullscreen";
    } else {
      btnFullscreen.textContent = "⛶"; // fullscreen icon
      btnFullscreen.title = "Fullscreen";
    }
  });

  // Audio track change: pause, switch, reload, play to avoid freezing
  audioSelect.addEventListener("change", (e) => {
    const tracks = video.audioTracks;
    if (!tracks) return;

    try {
      const selectedIndex = parseInt(e.target.value);
      if (isNaN(selectedIndex) || !tracks[selectedIndex]) return;

      // Pause video and save current time
      const currentTime = video.currentTime;
      video.pause();

      // Disable all tracks
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].enabled = false;
      }
      // Enable selected track
      tracks[selectedIndex].enabled = true;

      // Restore playback time and play
      video.currentTime = currentTime;
      video.play();
    } catch (error) {
      console.warn("Audio track switching error:", error);
    }
  });

  // Close button hides player and pauses video
  btnClose.onclick = () => {
    popup.style.display = "none";
    video.pause();

    // Exit fullscreen if currently in fullscreen mode
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        // Optional: handle errors if any
        console.warn("Failed to exit fullscreen:", err);
      });
    }
  };

  if (!moviesContainer || !searchInput) return;

  // Function to attach event listeners to edit buttons (called once on page load)
  function attachEditButtonListeners() {
    document
      .querySelectorAll('button[data-bs-target="#editMovieModal"]')
      .forEach((btn) => {
        btn.addEventListener("click", function () {
          document.getElementById("edit-movie-id").value =
            this.getAttribute("data-movie-id");
          document.getElementById("edit-title").value =
            this.getAttribute("data-title");
          document.getElementById("edit-rating").value =
            this.getAttribute("data-rating");
          document.getElementById("edit-language").value =
            this.getAttribute("data-language");
          document.getElementById("edit-duration").value =
            this.getAttribute("data-duration");
          document.getElementById("edit-genres").value =
            this.getAttribute("data-genres");
          document.getElementById("edit-top-rated").checked =
            this.getAttribute("data-top_rated") === "true";
          document.getElementById("edit-poster-preview").src =
            this.getAttribute("data-poster");
        });
      });
  }

  // Event delegation for edit buttons added to body (to handle dynamically added buttons)
  document.body.addEventListener("click", (e) => {
    if (e.target.matches('button[data-bs-target="#editMovieModal"]')) {
      const btn = e.target;
      document.getElementById("edit-movie-id").value =
        btn.getAttribute("data-movie-id");
      document.getElementById("edit-title").value =
        btn.getAttribute("data-title");
      document.getElementById("edit-rating").value =
        btn.getAttribute("data-rating");
      document.getElementById("edit-language").value =
        btn.getAttribute("data-language");
      document.getElementById("edit-duration").value =
        btn.getAttribute("data-duration");
      document.getElementById("edit-genres").value =
        btn.getAttribute("data-genres");
      document.getElementById("edit-top-rated").checked =
        btn.getAttribute("data-top_rated") === "true";
      document.getElementById("edit-poster-preview").src =
        btn.getAttribute("data-poster");
    }
    // Watch Now button handler (public page)
    if (e.target.classList.contains("watch-now-btn")) {
      const movieId = e.target.getAttribute("data-movie-id");
      if (movieId) openVideoPlayer(movieId);
    }
  });

  // Click movie card behavior (DISABLED download on card click for public)
  moviesContainer.addEventListener("click", (e) => {
    const card = e.target.closest(".movie-card");
    if (!card) return;
    const movieId = card.getAttribute("data-movie-id");
    if (!movieId) return;
    if (isAdminPage) {
      // On admin page, open edit modal for clicked movie card
      const editBtn = document.querySelector(
        `button[data-movie-id="${movieId}"][data-bs-target="#editMovieModal"]`
      );
      if (editBtn) {
        editBtn.click();
      }
    }
    // else: do nothing (no download on card click)
  });

  // Keyboard accessibility for movie cards (Enter and Space keys)
  moviesContainer.addEventListener("keydown", (e) => {
    if (
      e.target.classList.contains("movie-card") &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      const movieId = e.target.getAttribute("data-movie-id");
      if (!movieId) return;
      if (isAdminPage) {
        const editBtn = document.querySelector(
          `button[data-movie-id="${movieId}"][data-bs-target="#editMovieModal"]`
        );
        if (editBtn) {
          editBtn.click();
        }
      }
      // else: do nothing (no download on card keypress)
    }
  });

  // Debounce helper to limit requests
  function debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Live search function with error handling
  const liveSearch = debounce(async () => {
    const query = searchInput.value.trim();

    try {
      const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const movies = await response.json();

      moviesContainer.innerHTML = "";

      if (movies.length === 0) {
        moviesContainer.innerHTML =
          '<p class="text-light">No movies found.</p>';
        return;
      }

      movies.forEach((movie) => {
        const col = document.createElement("div");
        col.className = "col-sm-6 col-md-4 col-lg-3";
        if (isAdminPage) {
          // Admin card with Edit/Delete buttons
          col.innerHTML = `
            <div class="card h-100 shadow-sm movie-card" tabindex="0" data-movie-id="${
              movie.id
            }">
              <img src="/static/${movie.poster}" class="card-img-top" alt="${
            movie.title
          }" />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text">
                  Rating: ${movie.rating} | Language: ${
            movie.language
          } | Duration: ${movie.duration}
                </p>
                <p class="card-text mb-3">
                  <small class="text-muted">Genres: ${movie.genres.join(
                    ", "
                  )}</small>
                </p>
                <div class="mt-auto d-flex gap-2">
                  <button
                    class="btn btn-primary btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#editMovieModal"
                    data-movie-id="${movie.id}"
                    data-title="${movie.title}"
                    data-rating="${movie.rating}"
                    data-language="${movie.language}"
                    data-duration="${movie.duration}"
                    data-genres="${movie.genres.join(", ")}"
                    data-top_rated="${movie.top_rated ? "true" : "false"}"
                    data-poster="/static/${movie.poster}"
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-danger btn-sm"
                    onclick="confirmDelete('${movie.id}', '${movie.title
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')}')"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          // Public card with Download and Watch Now buttons
          col.innerHTML = `
            <div class="movie-card" tabindex="0" data-movie-id="${movie.id}">
              <div class="card-inner">
                <div class="card-front" style="background-image: url('/static/${
                  movie.poster
                }');" aria-hidden="true">
                  <div class="movie-title">${movie.title}</div>
                </div>
                <div class="card-back">
                  <span class="badge bg-warning text-dark mb-2">IMDB: ${
                    movie.rating
                  }</span>
                  <div><strong>Language:</strong> ${movie.language}</div>
                  <div><strong>Duration:</strong> ${movie.duration}</div>
                  <div><strong>Genres:</strong> ${movie.genres.join(", ")}</div>
                  ${
                    movie.top_rated
                      ? '<div class="top-rated mt-2">Top Rated</div>'
                      : ""
                  }
                  <div class="card-buttons mt-3 d-flex gap-2">
                    <button class="btn btn-success btn-sm watch-now-btn" data-movie-id="${
                      movie.id
                    }">Watch Now</button>
                    <a href="/download/${
                      movie.id
                    }" class="btn btn-primary btn-sm" download>Download</a>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
        moviesContainer.appendChild(col);
      });
    } catch (error) {
      console.error("Live search failed:", error);
      moviesContainer.innerHTML =
        '<p class="text-danger">Failed to load movies. Please try again.</p>';
    }
  }, 300);

  // Attach live search to input event
  searchInput.addEventListener("input", liveSearch);

  // Attach event listeners to initial edit buttons (only admin page)
  attachEditButtonListeners();

  // Trigger live search on page load if query param exists
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("q")) {
    searchInput.value = urlParams.get("q");
    liveSearch();
  }
});
