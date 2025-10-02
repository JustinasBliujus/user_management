import { Router } from 'express';
import bcrypt from 'bcrypt';
import { getUsers, blockUser, createUser, getUserByEmail, updateLoginTime, unblockUser, deleteUser, deleteUnverifiedUsers, verifyUser, findUserByToken } from '../database.js';
import { checkUser } from './check_user.js';
import { sendVerificationEmail } from './mailer.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

const TOKEN_BYTES_LENGTH = 32;
const SALT_ROUNDS = 10;

dotenv.config();
const router = Router();

router.get('/', (req, res) => {
    res.render('login', {
        title: 'Login',
        error: null,
    });
});

router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
        return res.render('login', { title: "Login", error: "User not found"});
    }

    try {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.render('login', { title: "Login", error: "Incorrect password"});
        }

        req.session.userEmail = user.email;
        req.session.status = user.status;

        await updateLoginTime(user.email);

        res.redirect('/dashboard'); 
    } catch (err) {
        res.render('login', { title: "Login", error: "Internal server error, please try again"});
    }
});

router.post('/users/block', checkUser({ requireVerified: true }), async (req, res) => {
    try {
        const { emails } = req.body;

        for (let email of emails) {
            const user = await getUserByEmail(email);
            if (!user) continue;
            if (user.status === 'blocked') continue; 

            await blockUser(email); 
        }

        res.send('Selected users blocked successfully');
    } catch (err) {
        res.status(500).send('Error blocking users');
    }
});

router.post('/users/unblock', checkUser({ requireVerified: true }), async (req, res) => {
    try {
        const { emails } = req.body;
        for (let email of emails) {
            const user = await getUserByEmail(email);
            if (!user) continue; 
            if (user.status !== 'blocked') continue; 

            await unblockUser(email); 
        }

        res.send('Selected users unblocked successfully');
    } catch (err) {
        res.status(500).send('Error unblocking users');
    }
});

router.post('/users/delete', checkUser({ requireVerified: true }), async (req, res) => {
    try {
        const { emails } = req.body;
        for (let email of emails) {
            const user = await getUserByEmail(email);
            if (!user) continue;

            await deleteUser(email); 
        }

        res.send('Selected users deleted successfully');
    } catch (err) {
        res.status(500).send('Error deleting users');
    }
});

router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register',
        error: null,
        success: null,
    });
});

router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const verificationToken = crypto.randomBytes(TOKEN_BYTES_LENGTH).toString('hex');

        const result = await createUser(name, surname, hashedPassword, email, verificationToken);

        sendVerificationEmail(email, verificationToken);

        res.render('register', {
            title: 'Register',
            success: 'Registration successful! Please check your email to verify your account.',
            error: null,
        });

    } catch (err) {

        if (err.code === 'ER_DUP_ENTRY') {

            return res.render('register', {
                title: 'Register',
                error: 'This email is already registered.',
                success: null,
            });
        }

        res.render('register', {
            title: 'Register',
            error: 'Error registering user. Please try again.',
            success: null,
        });
    }
});

router.post('/users/delete-unverified', checkUser({ requireVerified: true }), async (req, res) => {
    try {
        const deletedCount = await deleteUnverifiedUsers();
        if (deletedCount === 0) return res.send('No unverified users found');
        res.send(`Deleted ${deletedCount} unverified users.`);
    } catch (err) {
        res.status(500).send('Error deleting unverified users');
    }
});

router.get('/dashboard', checkUser(), async (req, res) => {
    try {
        const users = await getUsers();
        res.render('dashboard', { 
            title: "Dashboard", 
            users,
            currentUserEmail: req.session.userEmail,
            currentStatus: req.session.status,
        });
    } catch (err) {
        res.status(500).send("Error fetching users");
    }
});

router.get('/verify', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Invalid verification link');
    }

    try {
        const user = await findUserByToken(token);

        if (!user) {
            return res.status(400).send('Invalid or expired verification link');
        }
        if (user.status === 'blocked') {
            return res.status(403).send('User is blocked');
        }

        await verifyUser(user.email);

        res.send('Your email has been verified! You can now log in.');
    } catch (err) {
        res.status(500).send('Internal server error');
    }
});

router.post('/logout', checkUser(), (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out');
    }

    res.clearCookie('connect.sid'); 
    res.sendStatus(200); 
  });
});

export default router;