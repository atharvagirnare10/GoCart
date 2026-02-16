// ==========================================
// CONFIGURATION
// ==========================================

// 1. Local Development URL (Jab tu laptop pe kaam karega)
const LOCAL_URL = "http://127.0.0.1:5000/api";

// 2. Production URL (Tera Render wala backend)
const PROD_URL = "https://gocart-0r8s.onrender.com/api";

// ✅ SMART LOGIC (Automatic Switch):
// - Agar Vercel pe Environment Variable set hai -> Wo use karega.
// - Agar 'npm run dev' chal raha hai -> LOCAL_URL use karega.
// - Agar Live/Production hai -> PROD_URL use karega.
export const BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === "development" ? LOCAL_URL : PROD_URL);

console.log(`🚀 API Running on: ${process.env.NODE_ENV === "development" ? "Localhost" : "Production"} | URL: ${BASE_URL}`);

/**
 * Common API fetch wrapper
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Client-side par localStorage check karna zaroori hai
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      // ✅ Session/Cookies maintain karne ke liye important
      credentials: "include", 
      
      headers: {
        "Content-Type": "application/json",
        // ✅ Agar kabhi wapas Ngrok use kiya toh warning nahi aayegi
        "ngrok-skip-browser-warning": "true", 
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      // Error handling: Agar JSON nahi aaya toh crash nahi hona chahiye
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `API Error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    throw error;
  }
}