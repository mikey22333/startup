'use client'

import Link from 'next/link'
import UserMenu from './UserMenu'

interface HeaderProps {
  showUserMenu?: boolean
}

export const Header = ({ showUserMenu = true }: HeaderProps) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">I2A</span>
              </div>
              <span className="text-white font-bold text-xl">PlanSpark</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/workspace" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Workspace
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </Link>
            </nav>
          </div>

          {/* User Menu or Sign In */}
          {showUserMenu && (
            <div className="flex items-center">
              <UserMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
