import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

// Open a database connection using the correct async API from Expo SQLite
const sqlite = SQLite.openDatabaseSync('chat-app.db');

// Create the Drizzle client
export const db = drizzle(sqlite, { schema });

// Initialize function to create tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log('Creating users table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        avatar TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);
    
    console.log('Creating chats table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY
      );
    `);
    
    console.log('Creating chat_participants table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS chat_participants (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);
    
    console.log('Creating messages table...');
    await sqlite.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      );
    `);

    const messagesColumns = await sqlite.getAllAsync('PRAGMA table_info(messages);');

    // Add new columns if they don't exist

    if (!messagesColumns.some((column : any) => column.name === 'status')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'sent';
      `);
      console.log('Column "status" added to messages table.');
    } else {
      console.log('Column "status" already exists in messages table.');
    }

    if (!messagesColumns.some((column : any) => column.name === 'read_by')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN read_by TEXT DEFAULT '[]';
      `);
      console.log('Column "read_by" added to messages table.');
    } else {
      console.log('Column "read_by" already exists in messages table.');
    }

    if (!messagesColumns.some((column : any) => column.name === 'delivered_to')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN delivered_to TEXT DEFAULT '[]';
      `);
      console.log('Column "delivered_to" added to messages table.');
    } else {
      console.log('Column "delivered_to" already exists in messages table.');
    }

    if (!messagesColumns.some((column : any) => column.name === 'reaction')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN reaction TEXT;
      `);
      console.log('Column "reaction" added to messages table.');
    } else {
      console.log('Column "reaction" already exists in messages table.');
    }

    if (!messagesColumns.some((column : any) => column.name === 'is_deleted')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN is_deleted INTEGER NOT NULL DEFAULT 0
      `);
      console.log('Column "is_deleted" added to messages table.');
    } else {
      console.log('Column "is_deleted" already exists in messages table.');
    }

    if (!messagesColumns.some((column : any) => column.name === 'edited_at')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN edited_at INTEGER
      `);
      console.log('Column "edited_at" added to messages table.');
    } else {
      console.log('Column "edited_at" already exists in messages table.');
    }

    if (!messagesColumns.some((column : any) => column.name === 'media')) {
      await sqlite.execAsync(`
        ALTER TABLE messages 
        ADD COLUMN media TEXT
      `);
      console.log('Column "media" added to messages table.');
    } else {
      console.log('Column "media" already exists in messages table.');
    }
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 