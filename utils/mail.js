import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: `${process.env.email}`,
    pass: `${process.env.email_password}`,
  },
});

const mailer = async ({
  message,
  fullName,
  email,
  phoneNumber,
  company,
  subject,
  recieverName,
  recieverEmail,
}) => {
  const info = await transporter.sendMail({
    from: `${email}`,
    to: `${recieverEmail}`,
    subject: `${subject}`,
    html: `
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap : "2rem"
        }}>
        <div>
        <p style={{
            fontSize: '18px',
        }}>Dear <strong>${recieverName}</strong></p>
        <p>Hope this email finds you well</p>
        </div>
        <p>I am <strong>${fullName}</strong> and I work for <strong>${company}</strong> company. I wanna ask you abuot: ${subject}</p>
        <p style={{
            marginLeft: '25px' ,
            borderLeft: '2px solid gray' ,
            fontSize : '18px',
            color: 'gray'
        }}>${message}</p>
        <div>
        <p>Feel free to contact me via my email: <strong>${email}</strong>, or via my phone number: <strong>${phoneNumber}</strong></p>
        <p>Looking forward to hearing from you</p>
        </div>
        </div>
        `,
  });
};

export default mailer;
