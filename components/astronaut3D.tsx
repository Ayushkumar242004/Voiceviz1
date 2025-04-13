import { motion } from "framer-motion";

export function Astronaut3D() {
  return (
    <motion.div
      className="w-32 h-32 relative"
      animate={{
        y: [0, -10, 0],
        x: [0, 10, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <img
        src="/astro.png"
        alt="Astronaut"
        className="object-contain w-full h-full hidden lg:block"
      />
    </motion.div>
  );
}