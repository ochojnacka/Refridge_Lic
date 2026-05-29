import { Router, Request, Response } from 'express';
import { AppDataSource } from '../database';
import { User, UserRole } from '../models/User';
import { Restaurant } from '../models/Restaurant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const restaurantRepository = AppDataSource.getRepository(Restaurant);

interface RegisterBody {
  email: string;
  password: string;
  restaurantId: string;
  name: string;
  role?: UserRole;
}

interface LoginBody {
  email: string;
  password: string;
}

interface TokenPayload {
  id: string;
  email: string;
  restaurantId: string;
  role: UserRole;
}

// POST /auth/register
router.post('/register', async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { email, password, restaurantId, name, role = UserRole.MANAGER } = req.body;

    // Validate
    if (!email || !password || !restaurantId || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if restaurant exists
    const restaurant = await restaurantRepository.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = userRepository.create({
      email,
      passwordHash,
      restaurantId,
      name,
      role,
    });

    await userRepository.save(user);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      restaurantId: user.restaurantId,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Find user
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'User is inactive' });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      restaurantId: user.restaurantId,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;

    const newToken = generateToken(decoded);

    res.json({ token: newToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

// Helper function to generate JWT
function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '24h',
  });
}

export default router;
