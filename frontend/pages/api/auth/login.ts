import type { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from 'cookies-next';

// Pre-configured admin account
const ADMIN_ACCOUNT = {
  email: 'angelfieroink@hotmail.com',
  password: 'password',
  metamask: '0x057867A36b18b28eCfe3246Db29C3725e1ee7AFd',
  role: 'admin',
  quantum_score: 100,
  spirit_glyph_tier: 3
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Admin account check
    if (email === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      // Set admin session cookie with enhanced privileges
      setCookie('nibiru_session', 'admin_session', {
        req,
        res,
        maxAge: 60 * 60 * 24 * 7, // 7 days for admin
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      // Set additional admin cookies
      setCookie('user_role', 'admin', { req, res });
      setCookie('quantum_score', '100', { req, res });
      setCookie('spirit_glyph_tier', '3', { req, res });
      setCookie('metamask_address', ADMIN_ACCOUNT.metamask, { req, res });

      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        user: {
          email: ADMIN_ACCOUNT.email,
          role: ADMIN_ACCOUNT.role,
          quantum_score: ADMIN_ACCOUNT.quantum_score,
          spirit_glyph_tier: ADMIN_ACCOUNT.spirit_glyph_tier,
          metamask: ADMIN_ACCOUNT.metamask
        }
      });
    }

    // Test mode check
    if (email.endsWith('@test.dev')) {
      // Set a test session cookie
      setCookie('nibiru_session', 'test_session', {
        req,
        res,
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return res.status(200).json({
        success: true,
        message: 'Test login successful'
      });
    }

    // TODO: Replace with actual authentication logic
    const response = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(401).json({
        success: false,
        message: error.detail || 'Invalid credentials'
      });
    }

    const data = await response.json();

    // Set session cookie
    setCookie('nibiru_session', data.access_token, {
      req,
      res,
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
} 