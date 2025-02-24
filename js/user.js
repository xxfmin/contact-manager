let firstname = "";
let lastname = "";
let userId = 0;

function readCookie() {
  let cookies = document.cookie.split("; ");
  let sessionCookie = cookies.find((row) => row.startsWith("session="));
  if (sessionCookie) {
    let value = sessionCookie.split("=")[1];
    value = decodeURIComponent(value);
    let parts = value.split(",");
    if (parts.length === 3) {
      firstname = parts[0];
      lastname = parts[1];
      userId = parseInt(parts[2]);
    }
  } else {
    window.location.href = "index.html";
  }
}

// Display error message in the message container (red text)
function displayError(message) {
  let container = document.getElementById("messageContainer");
  let errorDiv = document.getElementById("errorMessage");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "errorMessage";
    errorDiv.style.color = "red";
    errorDiv.style.marginBottom = "10px";
    container.appendChild(errorDiv);
  }
  errorDiv.innerText = message;
}

// Display success message in the message container (green text)
function displaySuccess(message) {
  let container = document.getElementById("messageContainer");
  let successDiv = document.getElementById("successMessage");
  if (!successDiv) {
    successDiv = document.createElement("div");
    successDiv.id = "successMessage";
    successDiv.style.color = "green";
    successDiv.style.marginBottom = "10px";
    container.appendChild(successDiv);
  }
  successDiv.innerText = message;
}

// Clear any old messages
function clearMessages() {
  let errorDiv = document.getElementById("errorMessage");
  if (errorDiv) errorDiv.innerText = "";
  let successDiv = document.getElementById("successMessage");
  if (successDiv) successDiv.innerText = "";
}

function fetchUserFromDB() {
  let data = { userId: userId };

  fetch("api/getuserinfo.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.error) {
        displayError(response.error);
      } else {
        // Populate fields with DB data
        document.getElementById("username").value = response.username;
        document.getElementById("email").value = response.email;
        document.getElementById("password").value = "";
      }
    })
    .catch((err) => {
      displayError("Error fetching user info: " + err);
    });
}

document.addEventListener("DOMContentLoaded", function () {
  let savedUsername = localStorage.getItem("username") || "User";
  let savedPassword = localStorage.getItem("password") || "password";
  let savedEmail = localStorage.getItem("email") || "user@example.com";
  readCookie();
  console.log("ID: " + userId);

  // Set fields with default values initially
  document.getElementById("username").value = savedUsername;
  document.getElementById("password").value = savedPassword;
  document.getElementById("email").value = savedEmail;

  // Override with real DB data
  fetchUserFromDB();

  // Listen for form submit on accountForm
  document
    .getElementById("accountForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      clearMessages();

      let newUsername = document.getElementById("username").value;
      let newEmail = document.getElementById("email").value;
      let hiddenPassword = document.getElementById("password").value; // existing logic

      // Retrieve password-change fields
      let oldPass = document.getElementById("old-password").value;
      let newPass = document.getElementById("new-password").value;
      let confirmPass = document.getElementById("confirm-password").value;

      // If username/email fields are empty, display an error message
      if (!newUsername || !newEmail) {
        displayError("Please fill out all fields (username and email).");
        return;
      }

      // Update the user record (whether or not changing password)
      updateUserInDB(newUsername, newEmail, oldPass, newPass, confirmPass);
    });
});

function getUserDetails() {
  console.log("test");
}

function confirmDelete() {
  let container = document.getElementById("messageContainer");
  container.innerHTML = `
    <div id="deleteConfirmation" style="margin-bottom:10px;">
      <span style="color: red;">Are you sure you want to delete your account?</span>
      <button id="confirmDeleteBtn">Yes, Delete</button>
      <button id="cancelDeleteBtn">Cancel</button>
    </div>
  `;

  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", function () {
      displaySuccess("Account deleted successfully.");
      localStorage.clear();
      // Clear the session cookie
      document.cookie =
        "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    });

  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
      // Remove the confirmation message
      let confirmDiv = document.getElementById("deleteConfirmation");
      if (confirmDiv) {
        confirmDiv.remove();
      }
    });
}

function togglePasswordFields() {
  let passwordFields = document.getElementById("password-fields");
  let button = document.getElementById("edit-password-btn");

  if (passwordFields.style.display === "none") {
    passwordFields.style.display = "block";
    button.textContent = "Hide Password Fields";
  } else {
    passwordFields.style.display = "none";
    button.textContent = "Edit Password";
  }
}

function updateUserInDB(username, email, oldPass, newPass, confirmPass) {
  let data = {
    userId: userId,
    username: username,
    email: email,
    oldPass: oldPass,
    newPass: newPass,
    confirmPass: confirmPass,
  };

  fetch("api/updateuser.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((response) => {
      if (response.error) {
        displayError(response.error);
      } else if (response.success) {
        displaySuccess("Account updated successfully!");

        // Update localStorage with new data
        localStorage.setItem("username", username);
        localStorage.setItem("email", email);
        if (newPass) {
          localStorage.setItem("password", newPass);
        }

        // Clear password fields
        document.getElementById("old-password").value = "";
        document.getElementById("new-password").value = "";
        document.getElementById("confirm-password").value = "";
      }
    })
    .catch((err) => {
      displayError("Error updating account: " + err);
    });
}
