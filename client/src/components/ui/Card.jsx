import { motion } from "framer-motion";

/**
 * Reusable Card Component
 * A premium container with glassmorphism effects and subtle hover shadows.
 */
const Card = ({ children, className = "", noPadding = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-slate-900/50 backdrop-blur-xl border border-slate-800 
        rounded-[2rem] shadow-xl shadow-black/20 
        overflow-hidden transition-all duration-300
        ${!noPadding ? "p-8" : ""} 
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default Card;
