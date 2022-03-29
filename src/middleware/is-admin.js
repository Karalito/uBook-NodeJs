module.exports = (req, res, next) => {
    const isAdmin = req.session.isAdmin;
  
    if (!isAdmin) return res.redirect('/');
  
    next();
  };
  