"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { heroSlides } from "@/data/mockData";
import Link from "next/link";

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[600px] bg-black overflow-hidden group">
      {heroSlides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className="absolute inset-0">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          </div>
          
          <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center h-full">
            <div className="max-w-2xl space-y-6 animate-in slide-in-from-left-10 fade-in duration-700">
              <div className="inline-block bg-primary px-3 py-1 text-white text-xs font-bold uppercase tracking-[0.2em]">
                {slide.subtitle}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-heading italic uppercase text-white leading-[0.9] tracking-tighter">
                {slide.title}
              </h1>
              <div className="pt-4">
                <Link href={slide.link}>
                  <Button size="lg" className="rounded-none bg-white text-black hover:bg-primary hover:text-white border-2 border-white hover:border-primary text-lg px-8 h-14 font-bold uppercase tracking-wider transition-all">
                    {slide.cta} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevSlide}
          className="rounded-none border-white/20 bg-black/50 text-white hover:bg-primary hover:border-primary"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextSlide}
          className="rounded-none border-white/20 bg-black/50 text-white hover:bg-primary hover:border-primary"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 transition-all duration-300 ${index === currentSlide ? 'w-12 bg-primary' : 'w-6 bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
