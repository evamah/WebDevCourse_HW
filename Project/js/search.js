const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");
const welcomeMessage = document.getElementById("welcomeMessage");

// Check user login
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "login.html";
} else {
    //welcomeMessage.textContent = `Hello ${currentUser.firstName}`;
    document.getElementById("welcomeText").textContent =
        `Hello, ${currentUser.firstName}`;

    const img = document.getElementById("welcomeImage");

    if (currentUser.image) {
        img.src = currentUser.image;
        img.style.display = "block";
    }

}

// Get current user from localStorage
function getCurrentUser() {
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!sessionUser) return null;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    return users.find(u => u.username === sessionUser.username);
}

// API key
const API_KEY = "AIzaSyCLjs9TO-0WmPDhd86n5jiiQAt7v3VN-7c";
const MAX_RESULTS = 30;

// Click search button
searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (!query) return;

    const params = new URLSearchParams(window.location.search);
    params.set("q", query);
    window.history.pushState({}, "", `?${params}`);

    searchYouTube(query);
});

// Load from query string on refresh
const params = new URLSearchParams(window.location.search);
const queryFromUrl = params.get("q");
if (queryFromUrl) {
    searchInput.value = queryFromUrl;
    searchYouTube(queryFromUrl);
}

// Fetch YouTube
async function searchYouTube(query) {
    resultsDiv.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-info"></div>
        </div>
    `;

    try {
        // Search videos
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&key=${API_KEY}`;
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            displayResults([]);
            return;
        }

        // Collect video IDs
        const videoIds = searchData.items
            .map(item => item.id.videoId)
            .join(",");

        // Save video duration & views
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        // Create video objects
        const fullVideos = searchData.items.map(item => {
            const details = detailsData.items.find(
                v => v.id === item.id.videoId
            );

            return {
                id: item.id.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium.url,
                duration: details.contentDetails.duration,
                views: details.statistics.viewCount
            };
        });

        displayResults(fullVideos);

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load YouTube results
                </div>
            </div>
        `;
    }
}

function formatDuration(iso) {
    const match = iso.match(/PT(\d+M)?(\d+S)?/);

    const minutes = match[1] ? match[1].replace("M", "") : "0";
    const seconds = match[2] ? match[2].replace("S", "") : "00";

    return `${minutes}:${seconds.padStart(2, "0")}`;
}


function displayResults(videos) {

    resultsDiv.innerHTML = "";

    if (videos.length === 0) {
        resultsDiv.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">No results found</div>
            </div>
        `;
        return;
    }

    videos.forEach(video => {
        const alreadySaved = isVideoInAnyPlaylist(video.id);
        const col = document.createElement("div");
        col.className = "col-md-4 mb-4";

        col.innerHTML = `
            <div class="card h-100 shadow">
                <img src="${video.thumbnail}" class="card-img-top">

                <div class="card-body d-flex flex-column">
                    <h6 class="card-title" title="${video.title}">
                        ${video.title.length > 40
                ? video.title.slice(0, 40) + "..."
                : video.title}
                    </h6>

                    <p class="mb-1">
                        ${formatDuration(video.duration)}
                    </p>

                    <p class="mb-2">
                        ${Number(video.views).toLocaleString()} views
                    </p>

                    <button class="btn btn-info mt-auto"
                        onclick="playVideo('${video.id}')">
                         Play video
                    </button>
                    

                    <button class="btn ${alreadySaved ? "btn-secondary" : "btn-outline-warning"} mt-2"
    ${alreadySaved ? "disabled" : ""}
    onclick="openAddToPlaylistModal(
        '${video.id}',
        '${video.title.replace(/'/g, "")}',
        '${video.thumbnail}')">
    ${alreadySaved ? "Added Playlist" : " Add to Playlist"}
</button>


                </div>
            </div>
        `;

        resultsDiv.appendChild(col);
    });
}


let selectedVideo = null;

function openAddToPlaylistModal(videoId, title, thumbnail) {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));

    if (!user.playlists) {
        user.playlists = [];
    }

    selectedVideo = { videoId, title, thumbnail };

    const select = document.getElementById("playlistSelect");
    select.innerHTML = "";

    user.playlists.forEach((pl, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = pl.name;
        select.appendChild(option);
    });

    sessionStorage.setItem("currentUser", JSON.stringify(user));

    new bootstrap.Modal(
        document.getElementById("playlistModal")
    ).show();
}



function addVideoToPlaylist() {
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const userIndex = users.findIndex(u => u.username === sessionUser.username);
    const user = users[userIndex];

    if (!user.playlists) user.playlists = [];

    const select = document.getElementById("playlistSelect");
    const newName = document.getElementById("newPlaylistName").value.trim();

    let playlist;

    if (newName) {
        playlist = { name: newName, videos: [] };
        user.playlists.push(playlist);
        document.getElementById("newPlaylistName").value = "";
    } else {
        playlist = user.playlists[select.value];
    }

    const exists = playlist.videos.some(v => v.videoId === selectedVideo.videoId);

    if (!exists) {
        playlist.videos.push(selectedVideo);
    }

    // Update user data in users array
    users[userIndex] = user;
    localStorage.setItem("users", JSON.stringify(users));
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    bootstrap.Modal.getInstance(
        document.getElementById("playlistModal")
    ).hide();

    searchYouTube(searchInput.value);

    showRealToast();
}


function showRealToast() {
    const toastHTML = `
        <div class="toast show position-fixed bottom-0 end-0 m-3" style="z-index:1050">
            <div class="toast-header bg-info text-white">
                <strong class="me-auto">System</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                Video added to playlist successfully!   
                <br>
                <a href="playlists.html" class="fw-bold">Go to My Playlists</a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", toastHTML);

    setTimeout(() => {
        document.querySelector(".toast")?.remove();
    }, 4000);
}



function isVideoInAnyPlaylist(videoId) {
    const user = getCurrentUser();
    if (!user || !user.playlists) return false;

    return user.playlists.some(pl =>
        pl.videos.some(v => v.videoId === videoId)
    );
}



function playVideo(videoId) {
    const iframe = document.getElementById("videoFrame");
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    const modal = new bootstrap.Modal(
        document.getElementById("videoModal")
    );
    modal.show();
}

document
    .getElementById("videoModal")
    .addEventListener("hidden.bs.modal", () => {
        document.getElementById("videoFrame").src = "";
    });

