import express from 'express';
import router from './routes/router.js';
import session from 'express-session';
import dotenv from 'dotenv';
import { createUsersTable } from './database.js';

dotenv.config();

var app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', router); 

createUsersTable();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
