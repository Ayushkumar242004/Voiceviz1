"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Quote } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Anshi Sachan",
      role: "Frontend Developer",
      content:
        "Led the frontend development and UI design of the project. Crafted intuitive and responsive user interfaces, ensuring a seamless user experience across devices.",
      avatar: "/anshi.jpeg?height=40&width=40",
      
    },
    {
      name: "Ayush Kumar",
      role: "Backend Engineer",
      content:
        "Developed the backend infrastructure and integrated the ML model into the system. He handled database management, API development, and ensured smooth communication between the frontend and ML components.",
      avatar: "/ayush.png?height=40&width=40",
      
    },
    {
      name: "Ashish R Kalgutkar",
      role: "Backend Engineer",
      content:
        "Implemented the backend using FastAPI and developed the complete data visualization pipeline and automated the generation of detailed analytical reports, ensuring users received clear and actionable insights.",
      avatar: "/ashish.jpeg?height=40&width=40",
    
    },
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team.</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn more about the talented individuals behind VoiceViz          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Card className="h-full border hover:border-primary/50 transition-colors duration-300 border-border/50">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/40 mb-4" />
                  <p className="mb-6 text-muted-foreground">{testimonial.content}</p>
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

