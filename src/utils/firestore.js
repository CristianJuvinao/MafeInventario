// src/utils/firestore.js
// Helpers puros para construir rutas de Firestore.
// Sin estado, sin hooks — importable desde cualquier lugar.
import { collection, doc } from 'firebase/firestore';
import { db } from '../firebase';

export const userCol = (userId, name) =>
  collection(db, 'users', userId, name);

export const userDoc = (userId, name, id) =>
  doc(db, 'users', userId, name, id);

export const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString();
