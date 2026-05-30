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
  
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const completedDays = data.completedDays || [];
    
    const updateData: any = {
      totalScore: increment(score),
    };

    // Only add to completedDays if not already present
    if (!completedDays.includes(day)) {
      updateData.completedDays = arrayUnion(day);
      
      // Update streak - this is a simple logic, you might want something more robust
      // For now, let's just increment it if they finish a new day
      updateData.streak = increment(1);
    }

    if (badge) {
      updateData.badges = arrayUnion(badge);
    }

    await updateDoc(userRef, updateData);
  } catch (error) {
    console.error("Error saving progress:", error);
  }
}
