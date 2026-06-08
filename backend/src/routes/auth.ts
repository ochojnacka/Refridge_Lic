import { Router, Request, Response } from 'express';
import { AppDataSource } from '../database';
import { User, UserRole } from '../models/User';
import { Restaurant } from '../models/Restaurant';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken, authorizeRole, AuthRequest } from '../middleware/auth';

const router = Router();
const userRepository = AppDataSource.getRepository(User);
const restaurantRepository = AppDataSource.getRepository(Restaurant);

interface RegisterBody {
  email: string;
  password: string;
  restaurantName: string;
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
    const { email, password, restaurantName, name, role = UserRole.MANAGER } = req.body;

    // Walidacja uaktualniona o restaurantName
    if (!email || !password || !restaurantName || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sprawdzenie, czy użytkownik (email) już istnieje
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 1. Tworzenie NOWEJ restauracji (Workspace)
    const restaurant = restaurantRepository.create({
      name: restaurantName,
      // Jeżeli baza wymaga innych pól (np. city), dodaj tu wartości domyślne, np.:
      // city: 'Nie podano',
      // seats: 0,
      // avgCoversPerDay: 0
    });
    await restaurantRepository.save(restaurant);

    // 2. Haszowanie hasła
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Tworzenie użytkownika z przypisanym ID nowo utworzonej restauracji
    const user = userRepository.create({
      email,
      passwordHash,
      restaurantId: restaurant.id, // Automatycznie łączy użytkownika z nowym lokalem
      name,
      role, // Domyślnie MANAGER
    });

    await userRepository.save(user);

    // 4. Generowanie tokena
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

// GET /auth/employees - Pobieranie listy pracowników dla restauracji
router.get('/employees', authenticateToken, authorizeRole(['Menedzer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await userRepository.find({
      where: { restaurantId: req.user!.restaurantId },
      select: ['id', 'name', 'email', 'role', 'isActive'], // Ważne: Ze względów bezpieczeństwa nie pobieramy passwordHash!
      order: { role: 'ASC', name: 'ASC' }
    });
    res.json(users);
  } catch (error) {
    console.error('Błąd pobierania listy pracowników:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// POST /auth/employees - Tworzenie konta pracownika przez Menedżera
router.post('/employees', authenticateToken, authorizeRole(['Menedzer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Brak wymaganych pól' });
    }

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik z tym adresem e-mail już istnieje' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Tworzymy użytkownika i przypisujemy go automatycznie do restauracji Menedżera
    const user = userRepository.create({
      email,
      passwordHash,
      restaurantId: req.user!.restaurantId,
      name,
      role,
      isActive: true,
    });

    await userRepository.save(user);

    // Zwracamy dane nowo utworzonego użytkownika (bez hasła)
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Błąd tworzenia pracownika:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// PATCH /auth/profile - Aktualizacja własnych danych profilowych (dostępne dla każdego)
router.patch('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await userRepository.findOne({ where: { id: req.user!.id } });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Ten adres e-mail jest już zajęty' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;

    await userRepository.save(user);

    // Generujemy nowy token, ponieważ dane (np. email) mogły ulec zmianie
    const token = generateToken({
      id: user.id,
      email: user.email,
      restaurantId: user.restaurantId,
      role: user.role,
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, restaurantId: user.restaurantId }
    });
  } catch (error) {
    console.error('Błąd aktualizacji profilu:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// GET /auth/restaurant - Pobieranie szczegółowych danych restauracji
router.get('/restaurant', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const restaurant = await restaurantRepository.findOne({ where: { id: req.user!.restaurantId } });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restauracja nie znaleziona' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error('Błąd pobierania danych restauracji:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// PATCH /auth/restaurant - Aktualizacja danych lokalu (tylko Menedżer i Admin)
router.patch('/restaurant', authenticateToken, authorizeRole(['Menedzer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, city, seats, avgCoversPerDay, description } = req.body;
    const restaurant = await restaurantRepository.findOne({ where: { id: req.user!.restaurantId } });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restauracja nie znaleziona' });
    }

    if (name !== undefined) restaurant.name = name;
    if (city !== undefined) restaurant.city = city;
    if (seats !== undefined) restaurant.seats = seats;
    if (avgCoversPerDay !== undefined) restaurant.avgCoversPerDay = avgCoversPerDay;
    if (description !== undefined) restaurant.description = description;

    await restaurantRepository.save(restaurant);
    res.json(restaurant);
  } catch (error) {
    console.error('Błąd aktualizacji danych restauracji:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// DELETE /auth/employees/:id - Usuwanie konta pracownika (tylko Menedżer i Admin)
router.delete('/employees/:id', authenticateToken, authorizeRole(['Menedzer', 'Administrator']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Zabezpieczenie przed usunięciem samego siebie
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Nie możesz usunąć własnego konta z tego poziomu' });
    }

    // Szukamy użytkownika, upewniając się, że należy do tej samej restauracji
    const employee = await userRepository.findOne({ 
      where: { id, restaurantId: req.user!.restaurantId } 
    });

    if (!employee) {
      return res.status(404).json({ error: 'Pracownik nie został znaleziony w Twoim lokalu' });
    }

    await userRepository.remove(employee);
    res.json({ success: true, message: 'Konto pracownika zostało pomyślnie usunięte' });
  } catch (error) {
    console.error('Błąd podczas usuwania pracownika:', error);
    res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

export default router;
