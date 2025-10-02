import { getUserByEmail } from '../database.js';

export function checkUser({ requireVerified = false } = {}) {
    return async function (req, res, next) {
        try {
            const email = req.session.userEmail; 
            if (!email) {
                return res.render('login', { title: "Login", error: "Please log in first", email: "" });
            }

            const user = await getUserByEmail(email);
            if (!user) {
                return res.render('login', { title: "Login", error: "User not found", email: "" });
            }

            if (user.status === 'blocked') {
                return res.render('login', { title: "Login", error: "Your account is blocked", email: user.email });
            }

            if (requireVerified && user.status === 'unverified') {
                return res.render('verify', { title: "Verify Account", error: "Please verify your account first", email: user.email });
            }

            req.user = user;
            next();
        } catch (err) {
            console.error(err);
            if (!res.headersSent) {
                res.render('login', { title: "Login", error: "Internal server error", email: "" });
            }
        }
    };
}
