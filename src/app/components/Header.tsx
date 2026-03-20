"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3 sm:mt-6">
          <div className="relative flex items-center justify-between h-14 sm:h-17 px-4 sm:px-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/8">
            {/* Logo */}
            <Link
              href="/"
              className="relative w-12 h-12 sm:w-16 sm:h-16 block flex-shrink-0"
            >
              <Image
                alt="CatLogo"
                src="/LogoCat.png"
                fill
                className="object-contain"
              />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold tracking-wide uppercase">
              {["Features", "Partners", "Pricing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="hover:text-zinc-400 text-white transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Desktop CTA group */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-semibold text-white hover:text-zinc-400 transition-colors px-4 py-2"
              >
                Login
              </Link>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-xs font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2 rounded-xl"
                >
                  Get Started <ChevronRight className="w-3 h-3" />
                </Link>
              </motion.div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 rounded-2xl border border-white/8 bg-zinc-900/95 backdrop-blur-xl p-4 sm:hidden"
              >
                <div className="space-y-1 mb-4">
                  {["Features", "Partners", "Pricing"].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                </div>
                <div className="flex gap-2 pt-3 border-t border-white/8">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 transition-colors px-4 py-2.5 rounded-xl"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-sm font-bold text-black bg-amber-400 hover:bg-amber-300 transition-colors px-4 py-2.5 rounded-xl"
                  >
                    Get Started <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  );
}

export default Header;
