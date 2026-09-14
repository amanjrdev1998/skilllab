"use client";

import { X, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";

interface WishlistProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number;
  image: string;
  discount: number;
  rating: number;
  reviews: number;
}

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: WishlistProduct[];
  onRemove: (id: number) => void;
  onAddToCart: (id: number) => void;
}

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistItems,
  onRemove,
  onAddToCart,
}: WishlistModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Wishlist</h2>
              <p className="text-xs text-slate-500">{wishlistItems.length} items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {wishlistItems.length > 0 ? (
            <div className="space-y-4">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition group"
                >
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-300 flex items-center justify-center text-xs font-semibold text-slate-600">
                      ❤️
                    </div>

                    {item.discount > 0 && (
                      <span className="absolute left-1 top-1 rounded-lg bg-red-500 text-white px-1.5 py-0.5 text-[8px] font-bold">
                        -{item.discount}%
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500 font-semibold uppercase">
                        {item.category}
                      </p>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 mt-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{item.price}
                        </span>
                        {item.oldPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{item.oldPrice}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        ⭐ {item.rating} ({item.reviews} reviews)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
                      <button
                        onClick={() => onAddToCart(item.id)}
                        className="flex-1 px-2 py-1.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white text-xs font-semibold rounded-lg hover:shadow-md transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        Add
                      </button>

                      <button
                        onClick={() => onRemove(item.id)}
                        className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Heart className="w-4 h-4 fill-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Heart className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-600 font-semibold">Your wishlist is empty</p>
              <p className="text-xs text-slate-500 mt-1">
                Save your favorite items for later
              </p>
            </div>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="border-t border-slate-200 p-6 space-y-3 bg-slate-50">
            <button className="w-full py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-lg hover:shadow-lg transition">
              Add All to Cart
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
