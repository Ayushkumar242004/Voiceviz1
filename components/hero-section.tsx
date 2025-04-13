"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/components/auth-provider"
import { Astronaut3D } from "@/components/astronaut3D";

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isAuthenticated } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const waveColors = [
      "rgba(124, 58, 237, 0.5)", // Purple
      "rgba(79, 70, 229, 0.5)", // Indigo
      "rgba(59, 130, 246, 0.5)", // Blue
    ]

    let animationFrameId: number
    let time = 0

    const animate = () => {
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add mouse interaction
      const mouseX = mousePosition.x
      const mouseY = mousePosition.y
      const canvasRect = canvas.getBoundingClientRect()
      const relativeMouseX = mouseX - canvasRect.left
      const relativeMouseY = mouseY - canvasRect.top

      // Only apply mouse effect if mouse is over the canvas
      const mouseEffect =
        mouseX > canvasRect.left && mouseX < canvasRect.right && mouseY > canvasRect.top && mouseY < canvasRect.bottom

      waveColors.forEach((color, i) => {
        const amplitude = 20 + i * 10
        const frequency = 0.02 - i * 0.005
        const speed = 0.05 + i * 0.02

        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)

        for (let x = 0; x < canvas.width; x++) {
          // Add mouse interaction to the waves
          let distanceEffect = 0
          if (mouseEffect) {
            const distance = Math.sqrt(
              Math.pow(x - relativeMouseX, 2) + Math.pow(canvas.height / 2 - relativeMouseY, 2),
            )
            distanceEffect = Math.max(0, 30 - distance / 10)
          }

          const y = Math.sin(x * frequency + time * speed) * (amplitude + distanceEffect) + canvas.height / 2
          ctx.lineTo(x, y)
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        ctx.fillStyle = color
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
    }
  }, [mousePosition])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.6, 0.05, 0.01, 0.9] },
    },
  }

  return (
    <div className="relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      <div className="container relative z-10 mx-auto px-4 py-24 md:py-32">
        <motion.div
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Speak. Query. Visualize.
          </motion.h1>
          <motion.p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10" variants={itemVariants}>
            Transform your voice into powerful data visualizations instantly. Your data, simplified.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
            <Button asChild size="lg" className="text-lg px-8 relative overflow-hidden group">
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                <span className="relative z-10">{isAuthenticated ? "Go to Dashboard" : "Try Now"}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 hover:bg-primary/10 transition-colors">
              <Link href="/how-it-works">Getting Started</Link>
            </Button>
          </motion.div>

          {/* Add the Astronaut3D component */}
          <div className="absolute top-[2em] right-0 transform -translate-x-1/2">
                  <Astronaut3D />
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute top-10 right-10 w-12 h-12 rounded-full bg-primary/20"
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-10 w-8 h-8 rounded-full bg-purple-500/20"
            animate={{
              y: [0, 20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-40 left-20 w-6 h-6 rounded-full bg-blue-500/20"
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>
      </div>
    </div>
  )
}

