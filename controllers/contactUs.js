import mailer from "../utils/mail.js";

export const contact = async (req, res) => {
  const {
    message,
    fullName,
    email,
    phoneNumber,
    company,
    subject,
    recieverName,
    recieverEmail,
  } = req.body;

  try {
    const response = await mailer({
      message,
      fullName,
      email,
      phoneNumber,
      company,
      subject,
      recieverName,
      recieverEmail,
    });
    return res.status(200).json("Message sent");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
