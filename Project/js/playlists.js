const user = JSON.parse(sessionStorage.getItem("currentUser"));
if (!user) location.href = "login.html";

let selectedPlaylistIndex = null;
let filteredVideos = [];


const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (!currentUser) {
    window.location.href = "login.html";
} else {
    document.getElementById("usernameDisplay").textContent =
        `Hello ${currentUser.firstName}`;

    document.getElementById("userImage").src =
        currentUser.image || "default-user.png";
}

function loadPlaylists() {
    const list = document.getElementById("playlistsList");
    list.innerHTML = "";

    user.playlists.forEach((pl, index) => {
        const div = document.createElement("div");
        div.className = "playlist-item";
        div.textContent = pl.name;
        div.onclick = () => selectPlaylist(index);
        list.appendChild(div);
    });
}

function selectPlaylist(index) {
    selectedPlaylistIndex = index;
    const playlist = user.playlists[index];

    document.getElementById("playlistTitle").textContent = playlist.name;
    filteredVideos = [...playlist.videos];
    renderVideos();
}

// Render videos
function renderVideos() {
    const container = document.getElementById("videosContainer");
    container.innerHTML = "";

    if (filteredVideos.length === 0) {
        container.innerHTML = "<p>No videos in this playlist</p>";
        return;
    }

    filteredVideos.forEach((v, i) => {
        container.innerHTML += `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <img src="${v.thumbnail}" class="card-img-top">
                    <div class="card-body">
                        <h6>${v.title}</h6>
                        <button class="btn btn-sm btn-danger"
                                onclick="removeVideo(${i})">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

document.getElementById("searchInput").addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    filteredVideos = user.playlists[selectedPlaylistIndex].videos
        .filter(v => v.title.toLowerCase().includes(term));
    renderVideos();
});

// Sorting
function sortVideos(type) {
    filteredVideos.sort((a, b) =>
        type === "az"
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title)
    );
    renderVideos();
}

function removeVideo(index) {
    user.playlists[selectedPlaylistIndex].videos.splice(index, 1);
    saveUser();
    selectPlaylist(selectedPlaylistIndex);
}

function deletePlaylist() {
    if (!confirm("Delete this playlist?")) return;
    user.playlists.splice(selectedPlaylistIndex, 1);
    saveUser();
    location.reload();
}

function createPlaylist() {
    const name = prompt("Playlist name:");
    if (!name) return;
    user.playlists.push({ name, videos: [] });
    saveUser();
    loadPlaylists();
}

function saveUser() {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
    const users = JSON.parse(localStorage.getItem("users"));
    const i = users.findIndex(u => u.username === user.username);

    // Update user data in users array
    users[i] = user;

    // Update LocalStorage 
    localStorage.setItem("users", JSON.stringify(users));
}


loadPlaylists();
