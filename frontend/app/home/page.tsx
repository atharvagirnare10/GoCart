"use client";

import { useEffect, useState, Suspense } from "react"; 
import { getProducts, getCategories } from "@/services/product.service";
import { ArrowRight, Star, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight } from "lucide-react"; 
import { useRouter, useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard"; 
import { useQuery } from "@tanstack/react-query"; 

const sliderImages = [
  "/banner1.png", "/banner2.png", "/banner3.png", "/banner4.png", "/banner5.png", "/banner6.png"
];

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
    const params = new URLSearchParams(searchParams.toString());
    if (cat !== "All") params.set("category", cat);
    else params.delete("category");
    params.set("page", "1"); 
    router.push(`/home?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/home?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', position: 'relative', overflowX: 'hidden' }}>
      {/* Background Blobs */}
      <div style={{ position: 'fixed', inset: '0', overflow: 'hidden', pointerEvents: 'none', zIndex: '-10' }}>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {!searchQuery && (
        <div className="max-w-[1500px] mx-auto px-4 w-full">
          <div className="relative w-full h-[300px] md:h-[500px] overflow-hidden mt-32 mb-10 mx-auto rounded-3xl shadow-2xl group">
             {sliderImages.map((img, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"}`}>
                    <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                </div>
             ))}
             <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={24} /></button>
             <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/30 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={24} /></button>
          </div>

          <div className="w-full mb-16">
            <div className="category-scroll-container">
              <button onClick={() => handleCategoryChange("All")} className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}>All Products</button>
              {categories.map((cat: any) => (
                <button key={cat.category_name} onClick={() => handleCategoryChange(cat.category_name)} className={`category-btn ${selectedCategory === cat.category_name ? "active" : ""}`}>{cat.category_name}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="main-section" style={{ marginTop: searchQuery ? '9rem' : '0' }}>
        <div className="section-header">
            <h2 className="section-title">
              {searchQuery ? <>Results for <span className="text-indigo-600">"{searchQuery}"</span></> : <>{selectedCategory} <span className="hot-badge">Hot</span></>}
            </h2>
          <span className="page-badge">Page {page} of {totalPages}</span>
        </div>

        {isLoading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <button onClick={() => router.push(`/home`)} className="clear-btn">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
            </div>
            <div className="pagination-container">
              <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className="page-btn">Prev</button>
              <div className="page-number">{page} / {totalPages}</div>
              <button disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)} className="page-btn next">Next</button>
            </div>
          </>
        )}
      </section>

      <style jsx global>{`
        .blob { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.4; }
        .blob-1 { top: -10%; left: -10%; width: 600px; height: 600px; background: #a855f7; }
        .blob-2 { bottom: 10%; right: -10%; width: 500px; height: 500px; background: #22d3ee; }
        .blob-3 { top: 40%; left: 20%; width: 300px; height: 300px; background: #f472b6; }
        .category-scroll-container { display: flex; gap: 1rem; overflow-x: auto; padding: 1rem 0; }
        .category-btn { padding: 0.6rem 1.5rem; border-radius: 9999px; border: 1px solid #e2e8f0; cursor: pointer; }
        .category-btn.active { background: linear-gradient(135deg, #7c3aed, #d946ef); color: white; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1.5rem; }
        .main-section { max-width: 1500px; margin: 0 auto; padding: 0 1rem 4rem; }
        .pagination-container { display: flex; justify-content: center; gap: 1rem; margin-top: 3rem; }
        .page-btn { padding: 0.5rem 1rem; background: white; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
        .page-btn.next { background: #0f172a; color: white; }
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}