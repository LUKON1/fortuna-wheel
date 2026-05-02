const express = require('express');
const randomRouter = require('./random');
const app = express();
const port = process.env.PORT || 3000;



app.use(express.json());
app.use('/api/random', randomRouter);

app.listen(port, () => {
  console.log(`Fortuna wheel server running on port:${port}`);
});