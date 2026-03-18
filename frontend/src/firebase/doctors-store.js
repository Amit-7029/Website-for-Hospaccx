import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doctors as fallbackDoctors, normalizeDoctor } from "../data/doctors";
import { getFirebaseServices, isFirebaseConfigured } from "./client";

const COLLECTION_NAME = "doctors";

function doctorsCollection() {
  const { firestore } = getFirebaseServices();
  return firestore ? collection(firestore, COLLECTION_NAME) : null;
}

function normalizeRemoteDoctor(id, data) {
  return normalizeDoctor({
    id,
    ...data
  });
}

export async function loadDoctors() {
  if (!isFirebaseConfigured()) {
    return {
      doctors: fallbackDoctors,
      source: "local"
    };
  }

  const collectionRef = doctorsCollection();
  if (!collectionRef) {
    return {
      doctors: fallbackDoctors,
      source: "local"
    };
  }

  const snapshot = await getDocs(query(collectionRef, orderBy("name")));
  const remoteDoctors = snapshot.docs.map((entry) => normalizeRemoteDoctor(entry.id, entry.data()));
  const mergedDoctorsMap = new Map(fallbackDoctors.map((doctor) => [doctor.id, doctor]));
  remoteDoctors.forEach((doctor) => {
    mergedDoctorsMap.set(doctor.id, doctor);
  });
  const mergedDoctors = [...mergedDoctorsMap.values()].sort((left, right) => left.name.localeCompare(right.name));

  return {
    doctors: mergedDoctors,
    source: remoteDoctors.length ? "firestore" : "local"
  };
}

export async function uploadDoctorImage(file, doctorId) {
  const { storage } = getFirebaseServices();
  if (!storage) {
    throw new Error("Firebase Storage is not configured.");
  }

  const storageRef = ref(storage, `doctors/${doctorId}/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createDoctor(payload) {
  const collectionRef = doctorsCollection();
  if (!collectionRef) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const created = await addDoc(collectionRef, {
    ...payload,
    updatedAt: serverTimestamp()
  });

  return created.id;
}

export async function editDoctor(id, payload) {
  const { firestore } = getFirebaseServices();
  if (!firestore) {
    throw new Error("Firebase Firestore is not configured.");
  }

  await updateDoc(doc(firestore, COLLECTION_NAME, id), {
    ...payload,
    updatedAt: serverTimestamp()
  });
}

export async function removeDoctor(id) {
  const { firestore } = getFirebaseServices();
  if (!firestore) {
    throw new Error("Firebase Firestore is not configured.");
  }

  await deleteDoc(doc(firestore, COLLECTION_NAME, id));
}
