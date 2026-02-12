"use client";

import { useEffect, useState, Suspense } from "react";
import { getProducts, getCategories } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

// --- SLIDER IMAGES ---
const sliderImages = [
  "/banner1.png", 
  "/banner2.png",
  "/banner3.png",
  "/banner4.png",
  "/banner5.png",
  "/banner6.png"
];

/**
 * FIX: This is the root page component.
 * It provides the Suspense boundary required for useSearchParams() to work during builds.
 */
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-indigo-600 font-bold animate-pulse">Loading GoCart...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

/**
 * All your original logic and UI are moved here.
 * This component safely uses useSearchParams() because it is inside <Suspense>.
 */
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 1. Get State from URL ---
  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";
  const page = Number(searchParams.get("page")) || 1;

  const [categories, setCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // LOGIC: If no search, show Random Feed
  const isRandomFeed = !searchQuery; 

  // React Query for Products
  const { data, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, page, searchQuery, isRandomFeed], 
    queryFn: () => getProducts(selectedCategory, page, 30, searchQuery, isRandomFeed), 
    staleTime: 5 * 60 * 1000, 
  });

  const products = data?.products || [];
  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);

  // AUTO SLIDE EFFECT
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000); 
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams();
    if (cat !== "All") params.append("category", cat);
    params.append("page", "1"); 
    router.push(`/home?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    if (selectedCategory !== "All") params.append("category", selectedCategory);
    if (searchQuery) params.append("search", searchQuery);
    params.append("page", newPage.toString());
    
    router.push(`/home?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* BACKGROUND BLOBS */}
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '-10' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* HERO SECTION */}
      {!searchQuery && (
        <div className="max-w-[1500px] mx-auto px-4 w-full">
          <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mt-32 mb-10 mx-auto rounded-3xl shadow-2xl group">
             {sliderImages.map((img, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}
                >
                  <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                </div>
             ))}
             <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100">
                <ChevronLeft size={24} />
             </button>
             <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100">
                <ChevronRight size={24} />
             </button>
          </div>

          <div className="w-full mb-16">
            <div className="w-full overflow-hidden relative group rounded-2xl bg-white/50 backdrop-blur-sm border border-white shadow-sm p-2">
              <div className="category-scroll-container">
                <button 
                  onClick={() => handleCategoryChange("All")} 
                  className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}
                >
                  All Products
                </button>
                {categories.map((cat: any) => (
                  <button 
                    key={cat.category_name} 
                    onClick={() => handleCategoryChange(cat.category_name)} 
                    className={`category-btn ${selectedCategory === cat.category_name ? "active" : ""}`}
                  >
                    {cat.category_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT SECTION */}
      <section className="main-section" style={{ marginTop: searchQuery ? '9rem' : '0' }}>
        <div className="section-header">
          <h2 className="section-title">
            {searchQuery ? (
               <>Results for <span className="text-indigo-600">"{searchQuery}"</span></>
            ) : (
               <>{selectedCategory === "All" ? "Trending Now" : selectedCategory} <span className="hot-badge">Hot</span></>
            )}
          </h2>
          <span className="page-badge">Page {page} of {totalPages}</span>
        </div>

        {isLoading ? (
          <div className="product-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-text w-50"></div>
                <div className="skeleton-text w-25"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h2 className="empty-title">No products found</h2>
            <button onClick={() => router.push(`/home`)} className="clear-btn">Clear All</button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="pagination-container">
              <button 
                disabled={page === 1}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className={`page-btn ${page === 1 ? "disabled" : ""}`}
              >
                Prev
              </button>
              <div className="page-number">{page} / {totalPages}</div>
              <button 
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className={`page-btn next ${page >= totalPages ? "disabled" : ""}`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>

      {/* STYLES */}
      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }

        .blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.4; animation: float 6s ease-in-out infinite; }
        .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #a855f7; }
        .blob-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; animation-delay: 2s; }
        .blob-3 { top: 40%; left: 20%; width: 300px; height: 300px; background: #f472b6; filter: blur(100px); }

        .category-scroll-container { display: flex; gap: 1rem; overflow-x: auto; padding: 0.5rem; width: 100%; scrollbar-width: none; }
        .category-btn { flex: 0 0 auto; white-space: nowrap; padding: 0.6rem 1.5rem; border-radius: 9999px; font-weight: 600; cursor: pointer; border: 1px solid #e2e8f0; background: rgba(255, 255, 255, 0.8); color: #64748b; }
        .category-btn.active { background: linear-gradient(135deg, #7c3aed, #d946ef); color: #ffffff; }

        .main-section { max-width: 1500px; margin: 0 auto; padding: 0 1rem 6rem; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1.5rem; }
        
        .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 5rem; }
        .page-btn { padding: 0.75rem 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 1rem; cursor: pointer; }
        .page-btn.next { background: #0f172a; color: #ffffff; }
        .page-btn.disabled { opacity: 0.5; cursor: not-allowed; }

        .skeleton-card { aspect-ratio: 3/4; background: #ffffff; border-radius: 1.5rem; padding: 1rem; animation: pulse 1.5s infinite; }
        .skeleton-img { width: 100%; height: 75%; background: #f1f5f9; border-radius: 1rem; }
      `}</style>
    </div>
  );
}