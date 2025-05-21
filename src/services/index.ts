// src/services/index.ts
import { db } from '../firebase'
import { addDoc, collection } from 'firebase/firestore'
import { Evento } from '../types'



export async function guardarEvento(partidoId: string, evento: Evento) {
  try {
    const ref = collection(db, `partidos/${partidoId}/eventos`)
    await addDoc(ref, evento)
    console.log(`[Firestore] Evento guardado: ${evento.tipo} @ ${evento.tiempo}`)
  } catch (err) {
    console.error('[Firestore] Error al guardar evento:', err)
  }
}
