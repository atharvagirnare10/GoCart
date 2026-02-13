// ==========================================
// CONFIGURATION
// ==========================================
const LOCAL_URL = "http://127.0.0.1:5000/api";

// Apna Current Ngrok URL yahan daal (Har baar change hota hai agar free wala band ho jaye)
const NGROK_URL = process.env.NEXT_PUBLIC_API_URL || "https://gocart-0r8s.onrender.com/api"; 

// 👇 SWITCH: True = Dost/Mobile, False = Local Development
const USE_NGROK = true; 

// ✅ FIX: Humne 'process.env' hata diya taaki koi confusion na rahe
const BASE_URL = USE_NGROK ? NGROK_URL : LOCAL_URL;

console.log(`🔥 API MODE: ${USE_NGROK ? "Online (Ngrok)" : "Local"} | URL: ${BASE_URL}`);

/**
 * Common API fetch wrapper
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      // ✅ Ye zaroori hai cookie pass karne ke liye
      credentials: "include", 
      
      headers: {
        "Content-Type": "application/json",
        // ✅ Ye header Ngrok warning hatata hai
        "ngrok-skip-browser-warning": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `API Error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    throw error;
  }
}