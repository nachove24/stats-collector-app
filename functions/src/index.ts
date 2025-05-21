/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

//import {onRequest} from "firebase-functions/v2/https";
//import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// Inicializa la aplicación de Firebase Admin SDK
// Esto permite que tus funciones interactúen con otros servicios de Firebase
admin.initializeApp();

// Obtiene una referencia a la base de datos de Firestore
const db = admin.firestore();



// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


/**
 * Cloud Function que se activa cuando un documento es eliminado en la colección 'partidos'.
 * Esta función se encarga de borrar recursivamente todas las subcolecciones del documento eliminado.
 */
export const cleanupPartidoOnDelete = functions.firestore
  .document('partidos/{partidoId}') // Especifica la ruta del documento que escuchar
  .onDelete(async (snap, context) => { // 'snap' es el valor del documento antes de la eliminación
    const partidoId = context.params.partidoId;
    console.log(`🗑️ Documento de partido con ID: ${partidoId} ha sido eliminado. Iniciando limpieza de subcolecciones...`);

    // 1. Borrar la subcolección 'eventos'
    const eventosRef = db.collection('partidos').doc(partidoId).collection('eventos');
    const eventosSnapshot = await eventosRef.get();

    if (eventosSnapshot.empty) {
      console.log(`Subcolección 'eventos' para el partido ${partidoId} está vacía, no hay nada que borrar.`);
      return null; // No hay eventos, termina la función
    }

    // Crea un Batch de borrado para eliminar múltiples documentos de manera eficiente
    const batch = db.batch();
    eventosSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    try {
      await batch.commit(); // Ejecuta el borrado por lotes
      console.log(`✅ Subcolección 'eventos' del partido ${partidoId} eliminada correctamente (${eventosSnapshot.size} documentos).`);
    } catch (error) {
      console.error(`🔥 Error al borrar la subcolección 'eventos' del partido ${partidoId}:`, error);
      // Puedes manejar el error, por ejemplo, reintentar o registrarlo en un sistema de logs
    }

    // Si tuvieras otras subcolecciones (ej. 'comentarios', 'estadisticas_detalladas'),
    // repetirías el proceso para cada una aquí.
    /*
    const otraSubcoleccionRef = db.collection('partidos').doc(partidoId).collection('otra_subcoleccion');
    const otraSubcoleccionSnapshot = await otraSubcoleccionRef.get();
    const batch2 = db.batch();
    otraSubcoleccionSnapshot.docs.forEach(doc => {
      batch2.delete(doc.ref);
    });
    await batch2.commit();
    */

    return null; // Las Cloud Functions siempre deben devolver un valor o una promesa
  });
