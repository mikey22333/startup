'use client'

import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check if dark mode was previously enabled
    const savedMode = localStorage.getItem('darkMode')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedMode !== null) {
      setIsDarkMode(savedMode === 'true')
    } else {
      setIsDarkMode(systemPrefersDark)
    }
  }, [])

  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode.toString())
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  return { isDarkMode, toggleDarkMode }
}
