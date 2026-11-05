export interface AuthUser {
  username: string;
  displayName: string;
  role: string;
  faculty?: string;
  loginTime?: string;
}

export const AUTHORIZED_USERS = [
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

export function authenticateLocal(username: string, password: string): AuthUser | null {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  const matched = AUTHORIZED_USERS.find(
    (u) => u.username.toLowerCase() === cleanUser && u.password === cleanPass
  );

  if (matched) {
    return {
      username: matched.username,
      displayName: matched.displayName,
      role: matched.role,
      faculty: matched.faculty,
      loginTime: new Date().toISOString()
    };
  }

  return null;
}

