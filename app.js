const express = require('express');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

app.listen(3000, () => {
  console.log('Application running on port:3000');
});
