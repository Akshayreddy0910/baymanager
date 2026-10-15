import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const StarRating = ({ 
  value = 0, 
  onChange = () => {}, 
  readOnly = false, 
  size = "md", 
  showNumber = false 
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeConfig = {
    sm: { iconSize: 16, gap: "gap-1" },
    md: { iconSize: 24, gap: "gap-1.5" },
    lg: { iconSize: 36, gap: "gap-2" }
  };

  const { iconSize, gap } = sizeConfig[size] || sizeConfig.md;

  const stars = [];
  const displayValue = hoverValue > 0 ? hoverValue : value;

  for (let i = 1; i <= 5; i++) {
    const filled = i <= displayValue;
    
    stars.push(
      <motion.button
        key={i}
        type="button"
        disabled={readOnly}
        onMouseEnter={() => !readOnly && setHoverValue(i)}
        onMouseLeave={() => !readOnly && setHoverValue(0)}
        onClick={() => !readOnly && onChange(i)}
        whileHover={{ scale: readOnly ? 1 : 1.2 }}
        whileTap={{ scale: readOnly ? 1 : 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="transition-colors cursor-pointer disabled:cursor-default"
      >
        <Star 
          size={iconSize} 
          fill={filled ? "#fbbf24" : "none"} 
          color={filled ? "#fbbf24" : "#334155"} 
          strokeWidth={1.5} 
        />
      </motion.button>
    );
  }

  return (
    <div className={`flex items-center ${gap}`}>
      {stars}
      {showNumber && (
        <span className="ml-2 font-display font-bold text-slate-100 italic">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
