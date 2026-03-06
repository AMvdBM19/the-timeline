const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev_secret_change_me';
}

// If token exists, attach user payload to req.user and res.locals.user
exports.attachUser = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    res.locals.user = payload;
  } catch (err) {
    res.clearCookie('token');
    req.user = null;
    res.locals.user = null;
  }

  next();
};

// Block access if not logged in
exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).redirect('/login');
  }
  next();
};

exports.signToken = (user) => {
  const payload = {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  };

  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};

