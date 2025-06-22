import { Request, Response } from 'express';
import { supabase } from './supabase.js';
import { z } from 'zod';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Schema for email requests
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Reset password - sends email with reset link
export async function resetPassword(req: Request, res: Response) {
  try {
    const { email } = resetPasswordSchema.parse(req.body);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.protocol}://${req.get('host')}/reset-password`
    });

    if (error) {
      console.error('Reset password error:', error);
      return res.status(400).json({ 
        error: 'Failed to send reset email',
        details: error.message 
      });
    }

    res.json({ 
      message: 'Password reset email sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Reset password validation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Update password with reset token
export async function updatePassword(req: Request, res: Response) {
  try {
    const { password, access_token, refresh_token } = req.body;

    if (!password || !access_token || !refresh_token) {
      return res.status(400).json({ 
        error: 'Password and tokens are required' 
      });
    }

    // Set the session using the tokens from the email link
    const { error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if (sessionError) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token' 
      });
    }

    // Update the password
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Update password error:', error);
      return res.status(400).json({ 
        error: 'Failed to update password',
        details: error.message 
      });
    }

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Change email - sends confirmation email to new address
export async function changeEmail(req: AuthenticatedRequest, res: Response) {
  try {
    const { newEmail, password } = changeEmailSchema.parse(req.body);

    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify current password before allowing email change
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: password
    });

    if (signInError) {
      return res.status(400).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Update email (Supabase will send confirmation email)
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    }, {
      emailRedirectTo: `${req.protocol}://${req.get('host')}/change-email`
    });

    if (error) {
      console.error('Change email error:', error);
      return res.status(400).json({ 
        error: 'Failed to send email change confirmation',
        details: error.message 
      });
    }

    res.json({ 
      message: 'Email change confirmation sent to new address',
      newEmail: newEmail
    });

  } catch (error) {
    console.error('Change email validation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Confirm email change
export async function confirmEmailChange(req: Request, res: Response) {
  try {
    const { access_token, refresh_token } = req.query;

    if (!access_token || !refresh_token) {
      return res.status(400).json({ 
        error: 'Missing confirmation tokens' 
      });
    }

    // Set the session using the tokens from the confirmation email
    const { error } = await supabase.auth.setSession({
      access_token: access_token as string,
      refresh_token: refresh_token as string
    });

    if (error) {
      console.error('Email confirmation error:', error);
      return res.status(400).json({ 
        error: 'Invalid or expired confirmation link' 
      });
    }

    res.json({ message: 'Email changed successfully' });

  } catch (error) {
    console.error('Confirm email change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get current user email (masked for security)
export async function getCurrentUserEmail(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user?.email) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const email = req.user.email;
    const maskedEmail = maskEmail(email);

    res.json({ 
      email: maskedEmail,
      fullEmail: email 
    });

  } catch (error) {
    console.error('Get current user email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to mask email for display
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }
  
  const maskedLocal = localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1];
  return `${maskedLocal}@${domain}`;
}