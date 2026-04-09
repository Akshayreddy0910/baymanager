import { motion } from "framer-motion";

/**
 * Reusable Button Component
 * Supports various variants and sizes with premium hover effects.
 */
const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false, 
  type = "button",
  onClick 
}) => {
  // Variant styles mapping
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40",
    secondary: "bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700",
    ghost: "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50",
    danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white"
  };

  // Size styles mapping
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-6 py-3 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-2xl"
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        relative inline-flex items-center justify-center font-bold tracking-tight
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
};

export default Button;
