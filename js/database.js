import { db } from './firebase-config.js';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

export async function saveResume(userId, resumeData, resumeId = null) {
    try {
        const data = {...resumeData, userId, updatedAt: serverTimestamp() };
        if (resumeId) {
            console.log('Updating existing resume:', resumeId);
            await setDoc(doc(db, 'resumes', resumeId), data, { merge: true });
            return resumeId;
        } else {
            console.log('Creating new resume');
            data.createdAt = serverTimestamp();
            const ref = await addDoc(collection(db, 'resumes'), data);
            console.log('Resume created with ID:', ref.id);
            return ref.id;
        }
    } catch (error) {
        console.error('Database save error:', error);
        throw error;
    }
}

export async function getResume(resumeId) {
    try {
        console.log('Fetching resume:', resumeId);
        const snap = await getDoc(doc(db, 'resumes', resumeId));
        if (snap.exists()) {
            console.log('Resume found');
            return { id: snap.id, ...snap.data() };
        } else {
            console.warn('Resume does not exist:', resumeId);
            return null;
        }
    } catch (error) {
        console.error('Database fetch error:', error);
        throw error;
    }
}

export async function getUserResumes(userId) {
    try {
        console.log('Fetching resumes for user:', userId);
        const q = query(collection(db, 'resumes'), where('userId', '==', userId), orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        console.log('Found', snap.docs.length, 'resumes');
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching user resumes:', error);
        throw error;
    }
}

export async function deleteResume(resumeId) {
    try {
        console.log('Deleting resume:', resumeId);
        await deleteDoc(doc(db, 'resumes', resumeId));
        console.log('Resume deleted successfully');
    } catch (error) {
        console.error('Error deleting resume:', error);
        throw error;
    }
}