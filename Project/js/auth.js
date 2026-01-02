document.addEventListener("DOMContentLoaded", () => {
    const currentUser = sessionStorage.getItem("currentUser");
    const currentPage = window.location.pathname.split("/").pop();

    const userArea = document.getElementById("userArea");
    const usernameDisplay = document.getElementById("usernameDisplay");
    const userImage = document.getElementById("userImage");

    if (currentUser) {
        const user = JSON.parse(currentUser);

        // Show user info in the Navbar 
        if (userArea && usernameDisplay && userImage) {
            usernameDisplay.textContent = user.firstName;
            userImage.src = user.image;
            userArea.style.display = "flex";
        }

        // Block access to login/register pages if the user is already logged in
        const authPages = ["login.html", "register.html"];
        if (authPages.includes(currentPage)) {
            window.location.href = "search.html";
        }

    } else {
        // limit access if not logged in
        const protectedPages = ["search.html", "playlists.html"];

        if (protectedPages.includes(currentPage)) {
            window.location.href = "login.html";
        }
    }
});


// for playlist.js and search.js

function getCurrentUserFull() {
    const sessionUser = JSON.parse(sessionStorage.getItem("currentUser"));
    if (!sessionUser) return null;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    return users.find(u => u.username === sessionUser.username);
}

function saveUser(user) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.username === user.username);

    // Update user data in users array
    users[index] = user;

    // Update LocalStorage and SessionStorage 
    localStorage.setItem("users", JSON.stringify(users));
    sessionStorage.setItem("currentUser", JSON.stringify(user));
}
