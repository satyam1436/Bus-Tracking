document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const pNumber = document.getElementById("personalNumber").value;
    const password = document.getElementById("password").value;
    const department = document.getElementById("department").value;

    const res = await fetch("https://bus-tracking-6y1h.onrender.com/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, pNumber, password, department })
    });

    const data = await res.json();
    alert(data.message);

  });
