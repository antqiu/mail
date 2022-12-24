document.addEventListener("DOMContentLoaded", function () {
	// Use buttons to toggle between views
	document
		.querySelector("#inbox")
		.addEventListener("click", () => load_mailbox("inbox"));
	document
		.querySelector("#sent")
		.addEventListener("click", () => load_mailbox("sent"));
	document
		.querySelector("#archived")
		.addEventListener("click", () => load_mailbox("archive"));
	document.querySelector("#compose").addEventListener("click", compose_email);

	// By default, load the inbox
	load_mailbox("inbox");
});

function compose_email() {
	// Show compose view and hide other views
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "block";
	document.querySelector("#single-view").style.display = "none";

	// Clear out composition fields
	document.querySelector("#compose-recipients").value = "";
	document.querySelector("#compose-subject").value = "";
	document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#single-view").style.display = "none";

	// Show the mailbox name
	document.querySelector("#emails-view").innerHTML = `<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>`;

	// helper function to display email list in mailbox
	function listEmails(emails) {
		for (let i = 0; i < emails.length; i++) {
			const email = document.createElement("div");
			email.innerHTML = `
	  <strong>From: </strong> ${emails[i].sender} <br>
	  <strong>To: </strong>${emails[i].recipients}<br>	
		<strong>Subject: </strong> ${emails[i].subject}<br>
	  <strong>Timestamp: </strong> ${emails[i].timestamp}<br>
	  <hr>
	`;
			// change this so i use inline styling
			if (mailbox !== "sent") {
				if (emails[i].read) {
					email.style.backgroundColor = "grey";
				} else {
					email.style.backgroundColor = "white";
				}
			}

			email.addEventListener("click", () => {
				displayEmail(emails[i].id);
			});
			document.querySelector("#emails-view").append(email);
		}
	}

	// helper function to display email
	function displayEmail(id) {
		document.querySelector("#single-view").style.display = "block";
		document.querySelector("#emails-view").style.display = "none";
		fetch(`/emails/${id}`)
			.then((response) => response.json())
			.then((emails) => {
				// Print emails
				console.log(emails);
				const email = document.createElement("div");
				email.innerHTML = `
				<strong>From: </strong> ${emails.sender} <br>
				<strong>To: </strong>${emails.recipients}<br>
				<strong>Subject: </strong> ${emails.subject}<br>
				<strong>Timestamp: </strong> ${emails.timestamp}<br>
				${emails.body}
				<hr>`;

				if (mailbox !== "sent") {
					//add a reply button
					const reply = document.createElement("button");
					reply.innerHTML = "Reply";
					reply.classList.add("btn-primary");
					reply.addEventListener("click", () => {
						compose_email();
						document.querySelector("#compose-recipients").value = emails.sender;
						document.querySelector(
							"#compose-subject"
						).value = `Re: ${emails.subject}`;
						document.querySelector(
							"#compose-body"
						).value = `On ${emails.timestamp} ${emails.sender} wrote: ${emails.body}`;
					});
					email.append(reply);

					const mark = document.createElement("button");
					//mark as read button
					if (emails.read) {
						mark.innerHTML = "Mark as Unread";
						mark.classList.add("btn-primary");
						mark.addEventListener("click", () => {
							fetch(`/emails/${id}`, {
								method: "PUT",
								body: JSON.stringify({
									read: false,
								}),
							});
						});
						mark.addEventListener("click", () => displayEmail(id));
						email.append(mark);
					} else {
						mark.innerHTML = "Mark as Read";
						mark.classList.add("btn-primary");
						mark.addEventListener("click", () => {
							fetch(`/emails/${id}`, {
								method: "PUT",
								body: JSON.stringify({
									read: true,
								}),
							});
						});
						mark.addEventListener("click", () => displayEmail(id));
						email.append(mark);
					}

					// add an archive/unarchive button
					if (mailbox !== "archive") {
						const archive = document.createElement("button");
						archive.classList.add("btn-primary");
						archive.innerHTML = "Archive";
						archive.addEventListener("click", () => {
							fetch(`/emails/${id}`, {
								method: "PUT",
								body: JSON.stringify({
									archived: true,
								}),
							});
						});
						archive.addEventListener("click", () => load_mailbox("inbox"));
						email.append(archive);
					} else {
						const archive = document.createElement("button");
						archive.classList.add("btn-primary");
						archive.innerHTML = "Unarchive";
						archive.addEventListener("click", () => {
							fetch(`/emails/${id}`, {
								method: "PUT",
								body: JSON.stringify({
									archived: false,
								}),
							});
						});
						archive.addEventListener("click", () => load_mailbox("inbox"));
						email.append(archive);
					}
				}
				document.querySelector("#single-view").innerHTML = "";
				document.querySelector("#single-view").append(email);
			});
	}
	//shows inbox
	if (mailbox === "inbox") {
		fetch("/emails/inbox")
			.then((response) => response.json())
			.then((emails) => {
				// Print emails
				console.log(emails);
				listEmails(emails);
			});
	}

	// shows sent
	if (mailbox === "sent") {
		fetch("/emails/sent")
			.then((response) => response.json())
			.then((emails) => {
				// Print emails
				console.log(emails);
				listEmails(emails);
			});
	}

	// shows archive
	if (mailbox === "archive") {
		fetch("/emails/archive")
			.then((response) => response.json())
			.then((emails) => {
				// Print emails
				console.log(emails);
				listEmails(emails);
			});
	}
}

// runs on onSubmit
function sendMail() {
	const recipients = document.querySelector("#compose-recipients").value;
	const subject = document.querySelector("#compose-subject").value;
	const body = document.querySelector("#compose-body").value;

	fetch("/emails", {
		method: "POST",
		body: JSON.stringify({
			recipients: recipients,
			subject: subject,
			body: body,
		}),
	});
	load_mailbox("sent");
}
