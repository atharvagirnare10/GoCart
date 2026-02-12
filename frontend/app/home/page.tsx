"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react"; // Added Suspense
import { getProducts, getCategories } from "@/services/product.service";
import Link from "next/link";
import { ArrowRight, Star, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";

// 1. THIS IS THE FIX: Wrap the content in Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading Page...</div>}>
      <HomeContent />
    </Suspense>
  );
}

const sliderImages = [
  "/banner1.png",
  "/banner2.png",
  "/banner3.png",
  "/banner4.png",
  "/banner5.png",
  "/banner6.png"
];

// 2. Your original HomePage logic goes here
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const selectedCategory = searchParams.get("category") || "All";
  const page = Number(searchParams.get("page")) || 1;

  const [categories, setCategories] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isRandomFeed = !searchQuery; 

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
      
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '-10' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {!searchQuery && (
        <>
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
        </>
      )}

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
              <div key={i} className="skeleton-card"><div className="skeleton-img"></div></div>
            ))}
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {/* Pagination UI goes here... */}
          </>
        )}
      </section>

      {/* Styles omitted for brevity - Keep yours exactly as they were */}
    </div>
  );
}