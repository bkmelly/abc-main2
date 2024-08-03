const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2'); // Updated to mysql2 for promise support
const session = require('express-session');
const bodyParser = require('body-parser'); 
const path = require('path');
const MySQLStore = require('express-mysql-session')(session); // Import MySQL session store
require('dotenv').config(); // Load environment variables from .env file

// Create a database connection using environment variables
const dbconn = mysql.createConnection({
    host: localhost, // Use DB_HOST from .env
    user: abc_launch, // Use DB_USER from .env
    password: benaiah2003, // Use DB_PASSWORD from .env
    database: project100 // Use DB_NAME from .env
});

// Create MySQL session store
const sessionStore = new MySQLStore({
    expiration: 86400000, // 1 day in milliseconds
    createDatabaseTable: false, // Don't create the table as we already created it
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
        }
    },
    // Connection options
    connection: dbconn
});

// Initialize express app
const app = express();

// Middleware application
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');

// Configure session middleware
app.use(session({
    secret: vrBGh,QpVg:f4uWnZ, // Use SESSION_SECRET from .env
    resave: false,
    saveUninitialized: true,
    store: sessionStore, // Use the MySQL session store
    cookie: { secure: false } // Set to true if using https
}));

// Authorization middleware
app.use((req, res, next) => {
    const privateRoutes = ["/clients", "/dashboard"];
    const adminRoutes = ["/projects", "/admin"];
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        if (req.session.user.email !== process.env.ADMIN_EMAIL && adminRoutes.includes(req.path)) { // Use ADMIN_EMAIL from .env
            res.status(401).send("Unauthorized Access. Only admins allowed.");
        } else {
            next();
        }
    } else if (privateRoutes.includes(req.path) || adminRoutes.includes(req.path)) {
        res.status(401).send("Unauthorized Access. Login First");
    } else {
        next();
    }
});

// Authentication middleware
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    } else {
        res.redirect('/signin');
    }
};

// Routes
app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/about', (req, res) => {
    res.render('about.ejs');
});

app.get('/faq', (req, res) => {
    res.render('faq.ejs');
});

app.get('/blogs', (req, res) => {
    res.render('blogs.ejs');
});

app.get('/feature', (req, res) => {
    res.render('feature.ejs');
});

app.get('/pricing', (req, res) => {
    res.render('pricing.ejs');
});

app.get('/team', (req, res) => {
    res.render('team.ejs');
});

app.get('/testimonials', (req, res) => {
    res.render('testimonials.ejs');
});

app.get('/coming', (req, res) => {
    res.render('coming.ejs');
});

app.get('/contact', (req, res) => {
    res.render('contact.ejs');
});

app.get('/404', (req, res) => {
    res.render('404.ejs');
});

app.get('/signin', (req, res) => {
    res.render('sign.up.in.ejs');
});

app.get('/Kitchen', (req, res) => {
    res.render('multistep.ejs');
});

app.get('/check-out', (req, res) => {
    res.render('check-out.ejs');
});

// Sign-up route
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    dbconn.query('SELECT email FROM Users WHERE email = ?', [email], (err, result) => {
        if (err) {
            res.status(500).send('Server Error');
        } else if (result.length > 0) {
            res.render('sign.up.in.ejs', { error: "Email already in use. Sign Up" });
        } else {
            const hashedPassword = bcrypt.hashSync(password, 10);
            dbconn.query('INSERT INTO Users (username, password, email, role, dateJoined) VALUES (?, ?, ?, ?, NOW())', [username, hashedPassword, email, 'client'], (error) => {
                if (error) {
                    res.status(500).send('Server Error');
                } else {
                    res.send('<script>alert("Sign up successful!"); window.location.href = "/blogs";</script>');
                }
            });
        }
    });
});

// Sign-in route
app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    dbconn.query('SELECT * FROM Users WHERE email = ?', [email], (error, users) => {
        if (error) {
            res.status(500).send('Server Error');
        } else if (users.length === 0) {
            res.render('sign.up.in.ejs', { error: "Email not registered. Sign Up" });
        } else {
            const user = users[0];
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (passwordMatch) {
                req.session.user = user;
                res.redirect('/blogs');
            } else {
                res.render('sign.up.in.ejs', { error: "Incorrect password. Try again." });
            }
        }
    });
});

// Multistep form submission route
app.post('/Kitchen', (req, res) => {
    const { name, companyName, email, phone_number, industry, businessdescription, brandColors, Products, features, uniqueBenefits } = req.body;

    const sql = 'INSERT INTO clcompanyinfo (name, companyName, email, phone_number, industry, businessdescription, brandColors, Products, features, uniqueBenefits) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [name, companyName, email, phone_number, industry, businessdescription, brandColors, Products, features, uniqueBenefits];

    dbconn.query(sql, values, (error) => {
        if (error) {
            console.error('Database Error:', error); // Log the error
            res.status(500).send('Server Error');
        } else {
            res.send('<script>alert("Form submission successful!"); window.location.href = "/blogs";</script>');
        }
    });
});

// Newsletter subscription route
app.post('/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    const sql = 'INSERT INTO newslettersubscribers (email) VALUES (?)';
    dbconn.query(sql, [email], (error, results) => {
        if (error) {
            console.error('Database Error:', error);
            return res.status(500).send('Server Error');
        }
        res.send('Subscription successful');
    });
});

// Client dashboard
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard.ejs', { user: req.session.user });
});

// Admin and authenticated routes
app.get('/clients', isAuthenticated, (req, res) => {
    dbconn.query('SELECT * FROM Clients', (err, clients) => {
        if (err) {
            res.status(500).send('Error occurred');
        } else {
            res.render('clients.ejs', { clients });
        }
    });
});

app.get('/projects', isAuthenticated, (req, res) => {
    dbconn.query('SELECT * FROM Projects', (err, projects) => {
        if (err) {
            res.status(500).send('Error occurred');
        } else {
            res.render('projects.ejs', { projects });
        }
    });
});

app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin.ejs');
});

// Listen on the port specified by the environment variable or default to 7000
const PORT = process.env.PORT || 7000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
