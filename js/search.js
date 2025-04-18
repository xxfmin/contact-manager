// Cookies fields
let userId = 0;
let firstname = "";
let lastname = "";

// Read cookies
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

function toTitleCase(str) {
	let words = str.split(" ");
	for (let i = 0; i < words.length; i++) {
		let word = words[i];
		words[i] = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}
	return words.join(" ");
}

// Read cookie and update the header
document.addEventListener("DOMContentLoaded", function () {
	readCookie();
	checkAllFilters();
	searchContact();
	// Update <h2> if firstname is found
	let header = document.querySelector(".header h2");
	if (header && firstname && lastname) {
		header.textContent = firstname + " " + lastname + "'s Contacts";
	}

	// Add click event to the dropdown profile pic
	document.querySelector(".dropbtn").addEventListener("click", function () {
		document.querySelector(".dropdown-content").classList.toggle("show");
	});
});

// Log out
function doLogout() {
	document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
	sessionStorage.removeItem("userData");
	window.location.href = "index.html";
}

// verride default navigation
document.getElementById("logout").addEventListener("click", function (e) {
	e.preventDefault();
	doLogout();
});

// Toggle dropdown menu for filtering
function toggleDropdown() {
	document.getElementById("filter-content").classList.toggle("show");
}

// Filter button event
document
	.querySelector(".filter-button")
	.addEventListener("click", function (event) {
		event.stopPropagation(); // Prevents the click from closing the dropdown immediately
		toggleDropdown();
	});

// Close dropdown when clicking outside
document.addEventListener("click", function (event) {
	let dropdown = document.querySelector(".filter-container");
	if (!dropdown.contains(event.target)) {
		document.getElementById("filter-content").classList.remove("show");
	}
});

// Filter table based on search input
document.getElementById("searchButton").addEventListener("click", function () {
	let input = this.value.toLowerCase();
	let rows = document.querySelectorAll("table tr:not(:first-child)");

	searchContact();

	rows.forEach((row) => {
		let text = row.innerText.toLowerCase();
		row.style.display = text.includes(input) ? "" : "none";
	});
});

// Search if enter is hit (long way)

document.getElementById("search").addEventListener("keydown", function (event) {

	if(event.key === "Enter") {
		let input = this.value.toLowerCase();
		let rows = document.querySelectorAll("table tr:not(:first-child)");

		searchContact();

		rows.forEach((row) => {
			let text = row.innerText.toLowerCase();
			row.style.display = text.includes(input) ? "" : "none";
		});

	}

});



// Toggle the Add Contact form open and close
document.querySelector(".addContact").addEventListener("click", function () {
	let form = document.querySelector(".add-contact-form");
	if (form.style.display === "none" || form.style.display === "") {
		form.style.display = "flex";
	} else {
		form.style.display = "none";
	}
});

// Save contact button
document.getElementById("saveContact").addEventListener("click", async function () {
	let firstName = document.getElementById("contactFirstName").value;
	let lastName = document.getElementById("contactLastName").value;
	let email = document.getElementById("contactEmail").value;

	// Remove any existing error message if present
	let errorMessage = document.getElementById("contactErrorMessage");
	if (errorMessage) {
		errorMessage.remove();
	}

	// Display error message if all fields are not filled
	if (firstName === "" || lastName === "" || email === "") {
		errorMessage = document.createElement("div");
		errorMessage.id = "contactErrorMessage";
		errorMessage.style.color = "red";
		errorMessage.style.marginTop = "5px";
		errorMessage.innerText = "Please fill all fields.";

		let form = document.getElementById("add-contact-form");
		form.insertBefore(errorMessage, document.getElementById("saveContact"));
		return;
	}

	/*
	const exists = await doesContactExist();
	if(exists) {
		return;
	}
	 */

	
	/*
	let table = document.querySelector("table");
	let newRow = table.insertRow(-1); // Add row at the end

	newRow.innerHTML = `
	<td>${firstName}</td>
	<td>${lastName}</td>
	<td>${email}</td>
	<td>${new Date().toLocaleDateString()}</td>
	<td><button class="editBtn"><i class="fa fa-pencil"></i></button></td>
	<td><button class="deleteBtn"><i class="fa fa-trash-o"></i></button></td>
  `;
  */

	sendContactToPHP();

	// Clear input fields
	document.getElementById("contactFirstName").value = "";
	document.getElementById("contactLastName").value = "";
	document.getElementById("contactEmail").value = "";

	// Hide form after adding
	document.querySelector(".add-contact-form").style.display = "none";
});

// Check if contact exists with same email
async function doesContactExist() {

	let email = document.getElementById("contactEmail").value;

	var data = {
		email: email
	};

	try {
		let response = await fetch("api/checkcontact.php", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		let result = await response.json();


		if (result.error) {
			console.error("Error:", result.error);
		} else {
			console.log("Contact Exists:", result.exists);
			if (result.exists === "true") {
				errorMessage = document.createElement("div");
				errorMessage.id = "contactErrorMessage";
				errorMessage.style.color = "red";
				errorMessage.style.marginTop = "5px";
				errorMessage.innerText = "Contact Already Exists.";

				const form = document.getElementById("add-contact-form");
				form.insertBefore(errorMessage, document.getElementById("saveContact"));


				return true;

			}
		}
		return false;
	} catch(error) {
		console.error("Fetch error:", error);
		return false;
	}
}

// Send contact to PHP
function sendContactToPHP() {
	let ownerID = userId;

	let firstName = document.getElementById("contactFirstName").value;
	let lastName = document.getElementById("contactLastName").value;
	let email = document.getElementById("contactEmail").value;

	firstName = toTitleCase(firstName);
	lastName = toTitleCase(lastName);
	email = email.toLowerCase();

	var data = {
		ownerID: ownerID,
		firstName: firstName,
		lastName: lastName,
		email: email
	};

	console.log(JSON.stringify(data));

	fetch("api/addcontact.php", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((result) => {
			if (result.error) {
				console.error("Error:", result.error);
			} else {
				console.log("Contact added:", result);
				searchContact();
			}
		})
		.catch((error) => console.error("Fetch error:", error));
}

// Event listener for dynamically added buttons
document.addEventListener("click", function (event) {
	if (event.target.closest(".editBtn")) {
		editContact(event.target.closest(".editBtn"));
	}
	if (event.target.closest(".deleteBtn")) {
		var confirm = document.getElementById("deleteContactConfirm");
		confirm.style.display = "block";

		var deleteBtn = document.getElementById("confirmDelete");
		var cancelBtn = document.getElementById("cancelDelete");
		deleteBtn.addEventListener("click", function(){
			deleteContact(event.target.closest(".deleteBtn"));
			confirm.style.display = "none";
		})

		cancelBtn.addEventListener("click", function(){
			confirm.style.display = "none";
		}) 
	}
});

function editContact(button) {
	let row = button.closest("tr");
	let cells = row.querySelectorAll("td");

	let firstName = cells[0].innerText;
	let lastName = cells[1].innerText;
	let email = cells[2].innerText;

	// Convert cells into input fields
	cells[0].innerHTML = `<input type="text" value="${firstName}">`;
	cells[1].innerHTML = `<input type="text" value="${lastName}">`;
	cells[2].innerHTML = `<input type="email" value="${email}">`;

	// Change edit button to save button
	button.innerHTML = `<i class="fa fa-save"></i>`;
	button.onclick = function () {
		saveContact(button);
	};
}

function saveContact(button) {
	let row = button.closest("tr");
	let cells = row.querySelectorAll("td");

	let newFirstName = cells[0].querySelector("input").value;
	let newLastName = cells[1].querySelector("input").value;
	let newEmail = cells[2].querySelector("input").value;

	if (newFirstName === "" || newLastName === "" || newEmail === "") {
		alert("Please fill all fields.");
		return;
	}

	let contactId = row.getAttribute("contactid");

	newFirstName = toTitleCase(newFirstName);
	newLastName = toTitleCase(newLastName);
	newEmail = newEmail.toLowerCase();

	var data = {
		ContactID: contactId,
		firstName: newFirstName,
		lastName: newLastName,
		email: newEmail
	};

	fetch("api/editcontact.php", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((result) => {
			if(result.error) {
				console.error("Error:", result.error);
			} else {
				// Set new values
				cells[0].innerText = newFirstName;
				cells[1].innerText = newLastName;
				cells[2].innerText = newEmail;

				// Restore edit button
				button.innerHTML = `<i class="fa fa-pencil"></i>`;
				button.onclick = function () {
					editContact(button);
				};


				console.log("Contact Updated");
				searchContact();
			}
		})
		.catch(error => {
			console.error("Fatal Error:", error);
		});


}

function deleteContact(button) {

	let row = button.closest("tr");

	let contactId = row.getAttribute("contactid");

	let data = {
		ContactID: contactId
	}

	fetch("api/deletecontact.php", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((result) => {
			if(result.error) {
				console.error("Error:", result.error);
				alert("Error Deleting Contact"); // Change alert to something else
			} else {
				console.log("Contact Deleted");
				row.remove();
			}
		})
		.catch(error => {
			console.error("Fatal Error:", error);
		});

}

// Filtering table
function filterTable() {
	let searchValue = document.getElementById("search").value.toLowerCase();
	let firstNameEnabled = document.getElementById("fNameFilter").checked;
	let lastNameEnabled = document.getElementById("lNameFilter").checked;
	let emailEnabled = document.getElementById("emailFilter").checked;

	let table = document.getElementById("contactTable");
	let rows = table.getElementsByTagName("tr");

	for (let i = 1; i < rows.length; i++) {
		let cells = rows[i].getElementsByTagName("td");
		if (cells.length > 0) {
			let firstName = cells[0].textContent.toLowerCase();
			let lastName = cells[1].textContent.toLowerCase();
			let email = cells[2].textContent.toLowerCase();

			let match =
				(firstNameEnabled && firstName.includes(searchValue)) ||
				(lastNameEnabled && lastName.includes(searchValue)) ||
				(emailEnabled && email.includes(searchValue));

			rows[i].style.display = match ? "" : "none";
		}
	}
}

//document.getElementById("search").addEventListener("input", filterTable);
document.getElementById("fNameFilter").addEventListener("change", filterTable);
document.getElementById("lNameFilter").addEventListener("change", filterTable);
document.getElementById("emailFilter").addEventListener("change", filterTable);

function searchContact() {
	const search = document.getElementById("search").value;
	const fn = document.getElementById("fNameFilter");
	const ln = document.getElementById("lNameFilter");
	const email = document.getElementById("emailFilter");

	let ffn, fln, femail;

	if(fn.checked) {
		ffn = 1;
	} else {
		ffn = 0;
	}

	if(ln.checked) {
		fln = 1;
	} else {
		fln = 0;
	}

	if(email.checked) {
		femail = 1;
	} else {
		femail = 0;
	}

	var data = {
		OwnerID: userId,
		filterFirst: ffn,
		filterLast: fln,
		filterEmail: femail,
		search: search,
	};

	console.log(JSON.stringify(data));

	fetch("api/displaycontacts.php", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	})
		.then((response) => response.json())
		.then((result) => {
			if (result.error) {
				console.error("Error:", result.error);
			} else {
				console.log("Contacts queried:", result);

				// Select table
				let table = document.querySelector("table");

				// Remove old rows
				while (table.rows.length > 1) {
					table.deleteRow(1);
				}

				// Create a row for each contact
				result.contacts.forEach(contact => {
					let newRow = table.insertRow(-1);
					newRow.setAttribute("contactid", contact.ContactID);
					newRow.innerHTML = `
					<td>${contact.FirstName}</td>
					<td>${contact.LastName}</td>
					<td>${contact.Email}</td>
					<td>${new Date(contact.DateCreated).toLocaleDateString()}</td>
					<td><button class="editBtn"><i class="fa fa-pencil"></i></button></td>
					<td><button class="deleteBtn"><i class="fa fa-trash-o"></i></button></td>
				`;
				});
			}
		})
		.catch((error) => console.error("Fetch error:", error));
}



function checkAllFilters() {
	document.getElementById("fNameFilter").checked = true;
	document.getElementById("lNameFilter").checked = true;
	document.getElementById("emailFilter").checked = true;
}

