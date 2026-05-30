import { db } from "./firebase";
import { doc, updateDoc, arrayUnion, increment, getDoc, setDoc } from "firebase/firestore";

/**
 * Updates user progress after completing a challenge
 * @param userId User ID
 * @param day Day of the challenge (1-7)
 * @param score Score achieved
 * @param badge Optional badge name earned
 */
export async function saveChallengeProgress(userId: string, day: number, score: number, badge?: string) {
  const userRef = doc(db, "users", userId);
  
  console.log(`Starting save for Day ${day}, Score: ${score}`);
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
       console.error("User document not found during save.");
       return;
    }

    const data = userDoc.data();
    const completedDays = data.completedDays || [];
    
    const updateData: any = {};

    // Only add results and increment score if not already completed
    if (!completedDays.includes(day)) {
      updateData.completedDays = arrayUnion(day);
      updateData.totalScore = increment(score);
      updateData.streak = increment(1);
      
      console.log(`New Day detected. Incrementing streak and score.`);
    } else {
      console.log(`Day ${day} already completed. Skipping score increment.`);
    }

    if (badge) {
      updateData.badges = arrayUnion(badge);
    }

    await updateDoc(userRef, updateData);
    console.log("Progress saved successfully to Firestore.");
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error; // Re-throw so the UI can catch it
  }
}
