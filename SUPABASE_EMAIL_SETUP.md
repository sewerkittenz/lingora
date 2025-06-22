# Supabase Email Configuration Setup

To enable email functionality in your Lingora app, you need to configure email settings in your Supabase project:

## 1. Configure Email Templates in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/wjrqsfvsnlmefmjwzltc
2. Navigate to **Authentication** → **Email Templates**
3. Configure the following templates:

### Confirm Signup Template:
```html
<h2>Welcome to Lingora!</h2>
<p>Thank you for joining our language learning community!</p>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Your Email</a></p>
<p>Happy learning!</p>
<p>The Lingora Team</p>
```

### Reset Password Template:
```html
<h2>Reset Your Lingora Password</h2>
<p>We received a request to reset your password.</p>
<p>Click the link below to create a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>The Lingora Team</p>
```

## 2. Configure Email Provider

### Option A: Use Supabase's Built-in Email (Rate Limited)
- Supabase provides 30 emails per hour for free
- Go to **Authentication** → **Settings** → **SMTP Settings**
- Enable "Enable email confirmations"

### Option B: Configure Custom SMTP (Recommended for Production)
In **Authentication** → **Settings** → **SMTP Settings**:

1. **Enable custom SMTP**: Toggle on
2. **SMTP Host**: Your email provider's SMTP host
3. **SMTP Port**: Usually 587 for TLS
4. **SMTP User**: Your email username
5. **SMTP Pass**: Your email password
6. **SMTP Admin Email**: Your sender email address

Popular providers:
- **Gmail**: smtp.gmail.com:587 (use App Password)
- **SendGrid**: smtp.sendgrid.net:587
- **Mailgun**: smtp.mailgun.org:587

## 3. Configure Site URL and Redirect URLs

In **Authentication** → **Settings** → **General**:

1. **Site URL**: https://your-app-domain.netlify.app
2. **Redirect URLs**: Add these URLs:
   - https://your-app-domain.netlify.app/confirm-email
   - https://your-app-domain.netlify.app/reset-password
   - http://localhost:5000/confirm-email (for development)
   - http://localhost:5000/reset-password (for development)

## 4. Enable Email Confirmations

In **Authentication** → **Settings** → **General**:
- Toggle on "Enable email confirmations"
- Toggle on "Enable email change confirmations" (optional)

## Next Steps After Email Configuration:

1. Test email signup on your local development
2. Deploy to Netlify and update Site URL
3. Test production email flows

The app is now ready for deployment once email is configured!