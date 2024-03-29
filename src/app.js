require('dotenv').config();

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const conFlash = require('connect-flash');
const multer = require('multer');

const MONGODB_URI = process.env.MONGO_DB_KEY;
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;
const User = require('./models/user');
// Controllers
const errorController = require('./controllers/error');

// Utilities
const rootDir = require('./utils/path');

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: 'sessions' });
const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: 'images',
  filename: function (req, file, cb) {
    return cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
// View engine
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Middleware
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(path.join(rootDir, 'images')));
app.use(
  session({
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(conFlash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.getError500);
app.use(errorController.getError);

// Error handling mw
app.use((error, req, res, next) => {
  res.status(500).render('error500', {
    pageTitle: 'Error',
    path: '/500',
    isAuthenticated: req.session.isAuthenticated,
    isAdmin: req.session.isAdmin,
  });
});
// Database connection
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });

module.exports = app;
