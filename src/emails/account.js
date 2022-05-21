const sgMail = require("@sendgrid/mail");

//When sendgrid api key at hand then config it in dev.env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (user) => {
  const { email, name } = user;
  sgMail.send({
    to: email,
    from: "decentralizepost@gmail.com",
    subject: `Welcome to Task manager`,
    text: `Welcome to the app ${name}. Let me know how you get along with the app`,
  });
};

const sendGoodByeEmail = (user) => {
  const { email, name } = user;
  sgMail.send({
    to: email,
    from: "decentralizepost@gmail.com",
    subject: `Sorry to see you go!`,
    text: `Sorry to know you are leaving the app ${name}. Let us know if we could do better or get you back with us. thanks for being part of our community`,
  });
};
module.exports = {
  sendWelcomeEmail,
  sendGoodByeEmail,
};
