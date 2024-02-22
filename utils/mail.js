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

export const ContactMailer = async ({
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

export const verifycationCodeMailer = async (user) => {
  const info = await transporter.sendMail({
    from: `wouroudelkhaldi@gmail.com`,
    to: `${user.email}`,
    subject: "Account Verification for CoSpace Website",
    html: `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333;
          }
          p {
            margin: 0 0 1rem 0;
          }
          strong {
            font-weight: bold;
            color : '#4d6188';
          }
          em {
            font-style: italic;
            color: 'red';
          }
          a{ 
            width: '150px' ;
            height: '50px' ;
            background-color: '#4d6188' ;
            color : 'white' ;
          }
        </style>
      </head>
      <body>
        <div>
          <p>Hello ${user.fullName},</p>
          <p>We hope this email finds you well</p>
          <p>
            An account was created with your email: ${user.email} on CoSpace.
          </p>
          <p>
            If it was you, please verify your account by filling the code in the verification page by the code below:
          </p>
          <p>
            <strong>Verification code : <em>${user.verificationCode}</em></strong>
          </p>
          <p>
            If it wasn't you, please fill this code in the verification page to delete the account request directly
          </p>
          <p>
            <strong>Delete code : <em>${user.deleteCode}</em></strong>
          </p>
          <p>
            You can access the verification page via this button : 
            <a href:"http://localhost:3000/verify">Verify Account</a>
          </p>
          <p>
            Thank you for registering on our webiste, hope you enjoy browsing
          </p>
        </div>
      </body>
    </html>
    `,
  });
  console.log("email sent successfuly");
};
