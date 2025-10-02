import sgMail from '@sendgrid/mail';

export async function sendVerificationEmail(email, token) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Verify Your Account',
    text: `Verify Your Account

Use the link below to verify your account:

${process.env.MY_URL}/verify?token=${token}

If you did not request this, please ignore this email.`
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent');
  } catch (error) {
    console.error(error);
  }
}
