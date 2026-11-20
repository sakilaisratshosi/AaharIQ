import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'aahariq-db.json');

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  dietaryPreference: string;
  dailyCalorieGoal: number;
  allergies: string[];
  language: 'en' | 'bn';
  preferredCuisines: string[];
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DbPasswordReset {
  email: string;
  code: string;
  expiresAt: string;
  used: boolean;
}

export interface DbJournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodName: string;
  foodNameBn: string;
  fctCode?: string;
  servingLabel: string;
  servingGrams: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  source: string;
  notes?: string;
  createdAt: string;
}

export interface DbComparisonRecord {
  id: string;
  userId: string;
  title: string;
  servingGrams: number;
  foodCodes: string[];
  foodNames: string[];
  createdAt: string;
}

export interface DbSavedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  recipeName: string;
  recipeNameBn?: string;
  imageUrl?: string;
  savedAt: string;
}

export interface AaharIqDatabase {
  users: DbUser[];
  sessions: DbSession[];
  passwordResets: DbPasswordReset[];
  foodJournalEntries: DbJournalEntry[];
  foodComparisonHistory: DbComparisonRecord[];
  savedRecipes: DbSavedRecipe[];
}

const DEFAULT_DB: AaharIqDatabase = {
  users: [],
  sessions: [],
  passwordResets: [],
  foodJournalEntries: [],
  foodComparisonHistory: [],
  savedRecipes: [],
};

function ensureDbDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDb(): AaharIqDatabase {
  ensureDbDir();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      passwordResets: Array.isArray(parsed.passwordResets) ? parsed.passwordResets : [],
      foodJournalEntries: Array.isArray(parsed.foodJournalEntries) ? parsed.foodJournalEntries : [],
      foodComparisonHistory: Array.isArray(parsed.foodComparisonHistory) ? parsed.foodComparisonHistory : [],
      savedRecipes: Array.isArray(parsed.savedRecipes) ? parsed.savedRecipes : [],
    };
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

export function saveDb(db: AaharIqDatabase): void {
  ensureDbDir();
  const tmpFile = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash: derived, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const { hash: candidate } = hashPassword(password, salt);
  const bufA = Buffer.from(candidate, 'hex');
  const bufB = Buffer.from(hash, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(userId: string): { token: string; expiresAt: string } {
  const db = loadDb();
  const now = Date.now();
  // Prune expired sessions
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt).getTime() > now);

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(now + 1000 * 60 * 60 * 24 * 14).toISOString(); // 14 days
  db.sessions.push({
    token,
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt,
  });
  saveDb(db);
  return { token, expiresAt };
}

export function getUserBySessionToken(token?: string | null): DbUser | null {
  if (!token) return null;
  const db = loadDb();
  const now = Date.now();
  const session = db.sessions.find(
    (s) => s.token === token && new Date(s.expiresAt).getTime() > now
  );
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) || null;
}

export function deleteSessionToken(token?: string | null): void {
  if (!token) return;
  const db = loadDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDb(db);
}

export function toPublicUser(user: DbUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dietaryPreference: user.dietaryPreference,
    dailyCalorieGoal: user.dailyCalorieGoal,
    allergies: user.allergies,
    language: user.language,
    preferredCuisines: user.preferredCuisines,
    onboardingCompleted: user.onboardingCompleted,
  };
}
