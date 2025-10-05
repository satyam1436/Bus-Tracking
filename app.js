require("dotenv").config();
const bcrypt = require("bcryptjs");
const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
const connectDB = require("./utils/db");  // Import DB connection
const Employee = require("./models/Employee");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { secure: false, httpOnly: true } // set secure:true in production HTTPS
}));

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login"); // user not logged in → go to login
    }
    next(); // user logged in → continue
}

function preventBackHistory(req, res, next) {
    res.set(
        "Cache-Control",
        "no-cache, no-store, must-revalidate, private, max-age=0"
    );
    next();
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session.userId) {
        return res.redirect("/dashboard");
    }
    next();
}

function preventCache(req, res, next) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
    next();
}




const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // each IP can try max 5 logins per 15 minutes
    message: "Too many login attempts. Try again later."
});



app.use(helmet({ contentSecurityPolicy: false }));



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

const http = require("http");
const server = http.createServer(app);

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));



app.get("/", function (req, res) {
    res.render('index')
});

app.get("/login", preventCache, redirectIfLoggedIn, function (req, res) {
    res.render('login')
});


app.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await Employee.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.redirect("/dashboard");
        } else {
            res.send("Invalid credentials");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.get("/signup", preventCache, redirectIfLoggedIn, (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const { name, email, pNumber, password, department } = req.body;

        // check if user already exists
        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // const newEmployee = new Employee({ name, email, pNumber, password, department });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({
            name,
            email,
            pNumber,
            password: hashedPassword, // store hashed password
            department
        });
        await newEmployee.save();

        res.status(201).json({ message: "Signup successful", employee: newEmployee });

        res.redirect("/login");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});



// Dashboard route (protected)
app.get("/dashboard", requireLogin, preventBackHistory, (req, res) => {
    res.render("dashboard", { userId: req.session.userId });
});



// Profile route (protected)
app.get("/profile", requireLogin, preventBackHistory, async (req, res) => {
    const user = await Employee.findById(req.session.userId);
    res.render("profile", { user });
});


app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send("Server error");
        }
        res.clearCookie("connect.sid"); // clear session cookie
        return res.redirect("/login");
    });
});


app.get("/map", function (req, res) {
    res.render('map')
});

server.listen(PORT);
