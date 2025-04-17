'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShieldCheck, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export default function LandingPage() {
  const [animatedWord, setAnimatedWord] = useState('Your Voice')
  const words = ['Your Voice', 'Your Vote', 'Your Power', 'Your Right']
  const [wordIndex, setWordIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prevIndex) => (prevIndex + 1) % words.length)
      setAnimatedWord(words[(wordIndex + 1) % words.length])
    }, 3500)

    return () => clearInterval(interval)
  }, [wordIndex])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className='flex min-h-screen flex-col bg-white'>
      <header className='border-b border-gray-200 sticky top-0 z-10 bg-white'>
        <div className='container flex h-16 items-center justify-between'>
          <div className='flex items-center gap-2 font-bold text-xl text-black'>
            <ShieldCheck className='h-6 w-6 text-black' />
            <span>Evote</span>
          </div>

          {/* Mobile menu button */}
          <button
            className='md:hidden'
            onClick={toggleMobileMenu}
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='h-6 w-6 text-black' />
            ) : (
              <Menu className='h-6 w-6 text-black' />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className='hidden md:flex items-center gap-4'>
            <Link
              href='/login'
              className='text-sm font-medium text-gray-600 hover:text-black transition-colors'
            >
              Login
            </Link>
            <Link href='/signup'>
              <Button
                variant='outline'
                size='sm'
                className='text-black border-gray-300 hover:bg-black hover:text-white transition-all'
              >
                Sign Up
              </Button>
            </Link>
          </nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className='md:hidden border-t border-gray-200'
            >
              <div className='flex flex-col py-4 px-6 space-y-4'>
                <Link
                  href='/login'
                  className='text-sm font-medium text-gray-600 hover:text-black transition-colors py-2'
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link href='/signup' onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='w-full text-black border-gray-300 hover:bg-black hover:text-white transition-all'
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className='flex-1 flex flex-col'>
        <section className='container flex flex-1 flex-col items-center justify-center py-16 md:py-24 lg:py-32'>
          <div className='mx-auto flex max-w-[980px] flex-col items-center gap-8 text-center'>
            <div className='space-y-6'>
              <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl text-black'>
                Empowering Democracy Through
                <div className='h-20 md:h-24 flex items-center justify-center'>
                  <AnimatePresence mode='wait'>
                    <motion.span
                      key={animatedWord}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className='text-black block mt-2'
                    >
                      {animatedWord}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </h1>
              <p className='ml-4 md:ml-20 max-w-[700px] text-lg text-gray-600 md:text-xl'>
                Empowering democracy with secure, transparent, and reliable
                online elections.
              </p>
            </div>

            <div className='flex w-full max-w-md flex-col gap-4 sm:flex-row'>
              <Link href='/signup?role=voter' className='w-full'>
                <Button
                  size='lg'
                  className='w-full bg-black hover:bg-gray-800 text-white rounded-md shadow-sm transition-all'
                >
                  I am a Voter
                </Button>
              </Link>
              <Link href='/signup?role=admin' className='w-full'>
                <Button
                  size='lg'
                  variant='outline'
                  className='w-full border-gray-300 text-black hover:bg-black hover:text-white rounded-md shadow-sm transition-all'
                >
                  Create Election
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className='py-16 border-t border-gray-200'>
          <div className='container'>
            <div className='mx-auto grid max-w-5xl gap-8 md:grid-cols-3'>
              <div className='flex flex-col items-center gap-3 text-center p-6 rounded-xl hover:shadow-md transition-shadow'>
                <div className='rounded-full bg-gray-100 p-4'>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z'
                      stroke='#000000'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-black'>Secure Voting</h3>
                <p className='text-gray-600'>
                  Encryption ensures your vote remains confidential and
                  tamper-proof.
                </p>
              </div>
              <div className='flex flex-col items-center gap-3 text-center p-6 rounded-xl hover:shadow-md transition-shadow'>
                <div className='rounded-full bg-gray-100 p-4'>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z'
                      stroke='#000000'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-black'>
                  Transparent Process
                </h3>
                <p className='text-gray-600'>
                  Verify your vote was counted correctly with our transparent
                  verification system.
                </p>
              </div>
              <div className='flex flex-col items-center gap-3 text-center p-6 rounded-xl hover:shadow-md transition-shadow'>
                <div className='rounded-full bg-gray-100 p-4'>
                  {/* Custom Thumbs Up Icon */}
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 512 512'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M104 224V432C104 440.837 111.163 448 120 448H184V224H104ZM488 256C488 238.326 473.674 224 456 224H360L373.248 114.99C375.705 94.4463 360.956 76 340 76H324C313.14 76 303.328 82.6938 299.106 92.8607L240 240V448H424C471.2 448 488 398.442 488 352V256Z'
                      fill='black'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-black'>Easy to Use</h3>
                <p className='text-gray-600'>
                  Simple interface makes voting accessible to everyone,
                  anywhere, anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className='border-t border-gray-200 py-6 bg-white'>
        <div className='container flex flex-col items-center justify-between gap-4 md:flex-row'>
          <p className='text-sm text-gray-600'>
            &copy; {new Date().getFullYear()} Evote. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
