import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

export async function sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.MY_URL}/verify?token=${token}`;

    const mailOptions = {
        from: `"Task 5" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your account',
        html: `
            <p>Thank you for registering!</p>
            <p>Click the link below to verify your account:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (err) {
        console.error('Error sending verification email:', err);
    }
}

