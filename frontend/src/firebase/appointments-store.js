import { addDoc, collection } from "firebase/firestore";
import { getFirebaseServices, isFirebaseConfigured } from "./client";

const COLLECTION_NAME = "appointments";

function appointmentsCollection() {
  const { firestore } = getFirebaseServices();
  return firestore ? collection(firestore, COLLECTION_NAME) : null;
}

export async function createAppointment(payload) {
  if (!isFirebaseConfigured()) {
    return {
      id: `local-${Date.now()}`,
      ...payload
    };
  }

  const collectionRef = appointmentsCollection();
  if (!collectionRef) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const created = await addDoc(collectionRef, payload);
  return {
    id: created.id,
    ...payload
  };
}
