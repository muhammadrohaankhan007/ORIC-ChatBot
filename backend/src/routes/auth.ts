import { Router, Request, Response } from 'express';

export const authRouter = Router();

const AUTHORIZED_USERS = [
  {
    username: 'azharrizvi001',
    password: 'AzharRizvi@2026!',
    displayName: 'Azhar Rizvi',
    role: 'Director ORIC / Executive Lead',
    faculty: 'Office of Research, Innovation & Commercialization'
  },
  {
    username: 'msohaib002',
    password: 'MSohaib@2006!',
    displayName: 'M. Sohaib',
    role: 'ORIC Technical Lead & Administrator',
    faculty: 'Faculty of Information Technology'
  },
  {
    username: 'mrohaankhan003',
    password: 'MRohaanKhan@2006!',
    displayName: 'M. Rohaan Khan',
    role: 'ORIC Research & Commercialization Officer',
    faculty: 'Faculty of Pharmacy'
  }
];

authRouter.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  const user = AUTHORIZED_USERS.find(
    (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
  );

  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials. Only authorized SHU ORIC personnel may access this portal.'
    });
  }

  return res.json({
    success: true,
    user: {
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      faculty: user.faculty
    },
    token: `shu_token_${Buffer.from(user.username + ':' + Date.now()).toString('base64')}`
  });
});

