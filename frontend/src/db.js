import { openDB } from "idb";

const DB = "images";
const STORE = "history";

let dbPromise;

// Create DB (Singleton)
async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB, 1, {
      upgrade(db) {
        db.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
      },
    });
  }
  return dbPromise;
}

// Save image
export async function saveImage(imageData) {
  const db = await getDB();
  await db.add(STORE, {
    ...imageData,
    createdAt: Date.now(),
  });
}

// Get all images
export async function getImages() {
  const db = await getDB();
  const all = await db.getAll(STORE);
  // Sort by newest first
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

// Delete image
export async function deleteImage(id) {
  const db = await getDB();
  await db.delete(STORE, id);
}