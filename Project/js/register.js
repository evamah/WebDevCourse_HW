document.getElementById("registerForm").addEventListener("submit", registerUser);

// Helpers
function setValid(input) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
}

function setInvalid(input) {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
}


function registerUser(event) {
    event.preventDefault();

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const firstNameInput = document.getElementById("firstName");
    const imageInput = document.getElementById("image");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const firstName = firstNameInput.value.trim();
    const image = imageInput.value.trim();

    // Reset validation states
    usernameInput.classList.remove("is-valid", "is-invalid");
    passwordInput.classList.remove("is-valid", "is-invalid");
    confirmPasswordInput.classList.remove("is-valid", "is-invalid");
    firstNameInput.classList.remove("is-valid", "is-invalid");
    imageInput.classList.remove("is-valid", "is-invalid");

    let isValidForm = true;

    // Validate inputs
    if (!username) {
        setInvalid(usernameInput);
        isValidForm = false;
    } else {
        setValid(usernameInput);
    }

    if (!firstName) {
        setInvalid(firstNameInput);
        isValidForm = false;
    } else {
        setValid(firstNameInput);
    }

    if (!image) {
        setInvalid(imageInput);
        isValidForm = false;
    } else {
        setValid(imageInput);
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;
    if (!passwordRegex.test(password)) {
        setInvalid(passwordInput);
        isValidForm = false;
    } else {
        setValid(passwordInput);
    }

    if (password !== confirmPassword || !confirmPassword) {
        setInvalid(confirmPasswordInput);
        isValidForm = false;
    } else {
        setValid(confirmPasswordInput);
    }

    if (!isValidForm)
        return;


    // Load users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username exists
    const exists = users.some(
        user => user.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
        setInvalid(usernameInput);
        return;
    }

    // Add new user 
    const newUser = {
        id: Date.now(),
        username,
        password,
        firstName,
        image,
        playlists: []
    };

    // Save user to LocalStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Go to login page
    window.location.href = "login.html";
}
