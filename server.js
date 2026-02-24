const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const PORT = 3000;

const data = [
    { name: "Michael Choi", createdAt: "23-01-2013", message: "This is my message. This is my message. This is my message." },
    { name: "Michael Choi", createdAt: "15-01-2013", message: "This is my message. This is my message. This is my message." },
    { name: "Cory Whiteland", createdAt: "15-01-2013", message: "This is my message. This is my message. This is my message." },
    { name: "Cory Whiteland", createdAt: "01-01-2013", message: "This is my message. This is my message. This is my message." }
  ];

// Temporary route just to test the server
app.get('/', (req, res) => {
    res.render('index', { posts: data });
  });

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});