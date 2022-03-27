const app = require('./src/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is up on http://127.0.0.1:${PORT}`);
});

