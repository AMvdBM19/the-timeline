const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

function setAuthCookie(res, user) {
  const token = signToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

exports.showLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('auth', { mode: 'login', error: null, old: {} });
};

exports.showRegister = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('auth', { mode: 'register', error: null, old: {} });
};

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return res.status(400).render('auth', {
        mode: 'register',
        error: 'All fields are required.',
        old: { firstName, lastName, email }
      });
    }

    if (password.length < 6) {
      return res.status(400).render('auth', {
        mode: 'register',
        error: 'Password must be at least 6 characters.',
        old: { firstName, lastName, email }
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('auth', {
        mode: 'register',
        error: 'Password and confirmation do not match.',
        old: { firstName, lastName, email }
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).render('auth', {
        mode: 'register',
        error: 'A user with that email already exists.',
        old: { firstName, lastName, email }
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash
    });

    setAuthCookie(res, user);
    res.redirect('/');
  } catch (error) {
    console.error('Error during registration:', error.message);
    res.status(500).render('auth', {
      mode: 'register',
      error: 'Something went wrong. Please try again.',
      old: { firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email }
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).render('auth', {
        mode: 'login',
        error: 'Email and password are required.',
        old: { email }
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).render('auth', {
        mode: 'login',
        error: 'Invalid email or password.',
        old: { email }
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).render('auth', {
        mode: 'login',
        error: 'Invalid email or password.',
        old: { email }
      });
    }

    setAuthCookie(res, user);
    res.redirect('/');
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(500).render('auth', {
      mode: 'login',
      error: 'Something went wrong. Please try again.',
      old: { email: req.body.email }
    });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};

