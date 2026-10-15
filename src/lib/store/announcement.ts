import fs from 'fs';
import path from 'path';
import { AnnouncementConfig } from '@/types';

export const DEFAULT_ANNOUNCEMENT: AnnouncementConfig = {
  enabled: true,
  imageUrl: '/images/announcement-poster.jpg',
  title: 'Happy Dasara! Closed for Orders Till Oct 28th',
  linkUrl: '',
  showButton: true,
  buttonText: 'Continue to Store',
  showOncePerSession: true,
  updatedAt: new Date().toISOString(),
};

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store-announcement.json');

export async function getAnnouncementConfig(): Promise<AnnouncementConfig> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled !== false,
        imageUrl: typeof parsed.imageUrl === 'string' && parsed.imageUrl.trim() ? parsed.imageUrl.trim() : DEFAULT_ANNOUNCEMENT.imageUrl,
        title: typeof parsed.title === 'string' ? parsed.title : DEFAULT_ANNOUNCEMENT.title,
        linkUrl: typeof parsed.linkUrl === 'string' ? parsed.linkUrl : '',
        showButton: parsed.showButton !== false,
        buttonText: typeof parsed.buttonText === 'string' ? parsed.buttonText : 'Continue to Store',
        showOncePerSession: parsed.showOncePerSession !== false,
        updatedAt: parsed.updatedAt || DEFAULT_ANNOUNCEMENT.updatedAt,
      };
    }
  } catch (err) {
    console.error('Error reading announcement config file:', err);
  }

  // Fallback to default and ensure file exists
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_ANNOUNCEMENT, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error initializing announcement config file:', err);
  }

  return DEFAULT_ANNOUNCEMENT;
}

export async function updateAnnouncementConfig(updates: Partial<AnnouncementConfig>): Promise<AnnouncementConfig> {
  const current = await getAnnouncementConfig();
  const updated: AnnouncementConfig = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving announcement config file:', err);
    throw new Error('Failed to save announcement configuration.');
  }

  return updated;
}
