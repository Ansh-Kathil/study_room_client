import confetti from "canvas-confetti";

/**
 * Fires an energetic, multi-stage celebratory confetti blast
 * when a user gets "Accepted" on test cases or solution submission.
 */
export const fireAcceptedConfetti = () => {
  try {
    // 1. Initial burst from center
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#3b82f6"],
      zIndex: 9999,
    });

    // 2. Dual cannon blast from bottom corners after 200ms
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.75 },
        colors: ["#10b981", "#3b82f6", "#f59e0b"],
        zIndex: 9999,
      });

      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.75 },
        colors: ["#6366f1", "#ec4899", "#8b5cf6"],
        zIndex: 9999,
      });
    }, 200);

    // 3. Falling stars & sparkles after 400ms
    setTimeout(() => {
      confetti({
        particleCount: 35,
        spread: 100,
        origin: { y: 0.4 },
        shapes: ["star"],
        colors: ["#fbbf24", "#f43f5e", "#a855f7"],
        scalar: 1.2,
        zIndex: 9999,
      });
    }, 450);
  } catch (err) {
    console.error("Confetti trigger error:", err);
  }
};
