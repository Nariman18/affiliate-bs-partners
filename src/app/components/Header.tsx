import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import Image from "next/image";

function Header() {
  return (
    <div>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50"
      >
        <div className="mx-auto max-w-7xl px-6 mt-6">
          <div className="relative flex items-center justify-between h-14 px-6">
            {/* Logo */}
            <div className="relative w-35 h-20">
              <Image
                alt="CatLogo"
                src="/LogoCat.png"
                fill
                className="object-contain"
              />
            </div>

            {/* Links */}
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

            {/* CTA group */}
            <div className="flex items-center gap-3">
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
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

export default Header;
