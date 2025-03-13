"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, PlusCircle, Search, Activity, Phone, Users, BarChart2, Settings, Menu, X } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Mobile menu toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">AETamDa</h1>
          <ThemeToggle />
        </div>

        <div className="search-container">
          <div className="search-box">
            <Search className="search-icon" />
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className={`sidebar-link ${isActive("/") ? "active" : ""}`}>
            <Home className="sidebar-icon" />
            <span>Home</span>
          </Link>
          <Link href="/create" className={`sidebar-link ${isActive("/create") ? "active" : ""}`}>
            <PlusCircle className="sidebar-icon" />
            <span>Create</span>
          </Link>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  )
}

