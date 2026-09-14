"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
}

export default function SearchModal({ isOpen, onClose, products }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
          {/* Search Input */}
          <div className="border-b border-slate-200 p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() === "" ? (
              <div className="p-8 text-center text-slate-500">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Start typing to search for products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-slate-50 transition cursor-pointer flex gap-4"
                  >
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-600">
                        {product.badge}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-semibold uppercase">
                        {product.category}
                      </p>
                      <h3 className="font-semibold text-slate-900 line-clamp-2 mt-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-slate-900">
                          ₹{product.price}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{product.oldPrice}
                        </span>
                        <span className="text-xs font-semibold text-red-600">
                          -{product.discount}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <X className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
