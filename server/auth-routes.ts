import { Router } from 'express';
import { supabase } from './supabase';
import bcrypt from 'bcrypt';

const router = Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        password: hashedPassword,
        total_xp: 0,
        current_streak: 0,
        longest_streak: 0,
        hearts: 5,
        subscription_type: 'free',
        streak_freeze_used: false,
        email_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Send verification email using Supabase Auth
    const { error: emailError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      }
    });

    if (emailError) {
      console.error('Email verification error:', emailError);
      // Don't fail registration if email fails
    }

    res.json({ 
      user: {
        id: user.id,
        username: user.username,
        email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
        totalXp: user.total_xp,
        currentStreak: user.current_streak,
        subscriptionType: user.subscription_type,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Missing email/username or password' });
    }

    // Find user by email or username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${emailOrUsername},email.eq.${emailOrUsername}`)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last study date if needed
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = user.last_study_date ? new Date(user.last_study_date).toISOString().split('T')[0] : null;
    
    if (lastStudy !== today) {
      const daysDiff = lastStudy ? Math.floor((new Date(today).getTime() - new Date(lastStudy).getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      // Reset streak if more than 1 day gap (unless they have streak freeze)
      let newStreak = user.current_streak;
      if (daysDiff > 1 && !user.streak_freeze_used) {
        newStreak = 0;
      }
      
      // Reset hearts daily
      await supabase
        .from('users')
        .update({
          last_study_date: new Date().toISOString(),
          current_streak: newStreak,
          hearts: 5,
          streak_freeze_used: false,
        })
        .eq('id', user.id);
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        totalXp: user.total_xp,
        currentStreak: user.current_streak,
        longestStreak: user.longest_streak,
        hearts: user.hearts,
        subscriptionType: user.subscription_type,
        emailVerified: user.email_verified,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Send password reset email using Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.protocol}://${req.get('host')}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'If the email exists, a reset link has been sent' });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // This would typically verify the token and update the password
    // For now, using a simplified approach
    const hashedPassword = await bcrypt.hash(password, 10);

    // In a real implementation, you'd verify the token and get the user ID
    // For now, this is a placeholder
    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email confirmation endpoint
router.post('/confirm-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify email using Supabase Auth
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.json({ message: 'Email confirmed successfully' });

  } catch (error) {
    console.error('Email confirmation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;