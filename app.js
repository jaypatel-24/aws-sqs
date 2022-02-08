const express = require('express');
const app = express();
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', require('./routes/index'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
