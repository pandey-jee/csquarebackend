const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email configuration not found. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send contact form email
const sendContactEmail = async (contact) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email transporter not configured, skipping email send');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to admin
    subject: `New Contact Form Submission: ${contact.subject || 'General Inquiry'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00ffff; border-bottom: 2px solid #00ffff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Contact Details</h3>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Type:</strong> ${contact.type || 'General'}</p>
          <p><strong>Subject:</strong> ${contact.subject || 'No subject'}</p>
          <p><strong>Submitted:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${contact.message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This message was sent from the C-Square Club contact form.
            <br>
            Contact ID: ${contact.id}
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Contact email sent successfully');
  } catch (error) {
    console.error('Failed to send contact email:', error);
    throw error;
  }
};

// Send welcome email to new team members (optional feature)
const sendWelcomeEmail = async (teamMember) => {
  const transporter = createTransporter();
  
  if (!transporter || !teamMember.email) {
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: teamMember.email,
    subject: 'Welcome to C-Square Club Team!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00ffff; border-bottom: 2px solid #00ffff; padding-bottom: 10px;">
          Welcome to C-Square Club! 🚀
        </h2>
        
        <p>Hi ${teamMember.name},</p>
        
        <p>Welcome to the C-Square Club team! We're excited to have you join us as our new <strong>${teamMember.position}</strong>.</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Your Profile</h3>
          <p><strong>Position:</strong> ${teamMember.position}</p>
          <p><strong>Join Date:</strong> ${new Date(teamMember.joinDate).toLocaleDateString()}</p>
        </div>
        
        <p>Your profile is now live on our website, and you're part of our innovative coding community!</p>
        
        <p>Best regards,<br>The C-Square Club Team</p>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            Visit our website: <a href="http://localhost:5173">C-Square Club</a>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error for welcome emails
  }
};

// Test email configuration
const testEmailConfig = async () => {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email configuration not found' };
  }

  try {
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: 'Email configuration is invalid', error: error.message };
  }
};

module.exports = {
  sendContactEmail,
  sendWelcomeEmail,
  testEmailConfig
};
