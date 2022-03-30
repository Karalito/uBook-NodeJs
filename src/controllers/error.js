// All logic refered to errors

exports.getError = (req, res, next) => {
  res.status(404).render('error', {
    pageTitle: 'Page Not Found',
    path: '',
    isAuthenticated: req.session.isAuthenticated,
  });
};

exports.getError500 = (req, res, next) => {
  res.status(500).render('error500', {
    pageTitle: 'Error',
    path: '/500',
    isAuthenticated: req.session.isAuthenticated,
  });
};
