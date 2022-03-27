const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');

const MONGODB_URI =
  'mongodb+srv://admin:GyNzMeNAC156cx6j@ubook-cluster.fxhvt.mongodb.net/uBook?retryWrites=true&w=majority';

const User = require('./models/user');
// Controllers
const errorController = require('./controllers/error');

// Utilities
const rootDir = require('./utils/path');

const app = express();
const store = new MongoDBStore({ uri: MONGODB_URI, collection: 'sessions' });
const csrfProtection = csrf();

// Routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
// View engine
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'public')));
app.use(
  session({
    secret: 'q3Y2OksUMhme5oiy7oNtOHKhULo0Bt9bQk',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.getError);

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
