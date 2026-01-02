document.getElementById("loginForm").addEventListener("submit", loginUser);

// Helpers
function setValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
}

function setInvalid(input) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
}


function loginUser(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Reset validation states
    usernameInput.classList.remove("is-valid", "is-invalid");
    passwordInput.classList.remove("is-valid", "is-invalid");

    // Validate inputs
    if (!username || !password) {
        setInvalid(usernameInput);
        setInvalid(passwordInput);
        return;
    }

    // Load users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Find user
    const user = users.find(
        u =>
            u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password
    );

    if (!user) {
        setInvalid(usernameInput);
        setInvalid(passwordInput);
        return;
    }

    setValid(usernameInput);
    setValid(passwordInput);

    // Save current user in SessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    // Go to search page
    window.location.href = "search.html";
}
