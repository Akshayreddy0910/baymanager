import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

/**
 * StarRating Component
 * A reusable rating component for collecting and displaying star ratings.
 * supports both interactive selection and read-only display modes.
 */
const StarRating = ({ 
  value = 0, 
  onChange = () => {}, 
  readOnly = false, 
  size = "md", 
  showNumber = false 
}) => {
  // hoverValue tracks which star is currently being hovered over for visual preview
  // We keep it separate from value so we don't accidentally update the actual rating until clicked
  const [hoverValue, setHoverValue] = useState(0);

  // Define size variants for icons and spacing
  const sizeConfig = {
    sm: { iconSize: 16, gap: "gap-1" },
    md: { iconSize: 24, gap: "gap-1.5" },
    lg: { iconSize: 36, gap: "gap-2" }
  };

  const { iconSize, gap } = sizeConfig[size] || sizeConfig.md;

  // Build the stars array using a classic for loop as requested
  const stars = [];
  const displayValue = hoverValue > 0 ? hoverValue : value;

  for (let i = 1; i <= 5; i++) {
    const filled = i <= displayValue;
    
    stars.push(
      <motion.button
        key={i}
        // type="button" is critical here to prevent the button from 
        // triggering a form submit when used inside a <form> tag.
        type="button"
        disabled={readOnly}
        // Interaction handlers only active when not in read-only mode
        onMouseEnter={() => !readOnly && setHoverValue(i)}
        onMouseLeave={() => !readOnly && setHoverValue(0)}
        onClick={() => !readOnly && onChange(i)}
        // Scale animations for better tactile feel
        // readOnly disables these so it doesn't feel clickable
        whileHover={{ scale: readOnly ? 1 : 1.2 }}
        whileTap={{ scale: readOnly ? 1 : 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="transition-colors cursor-pointer disabled:cursor-default"
      >
        <Star 
          size={iconSize} 
          // Use amber-400 (#fbbf24) for filled states, slate-700 (#334155) for empty
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
      {/* Optional numeric display, rounded to 1 decimal place for average accuracy */}
      {showNumber && (
        <span className="ml-2 font-display font-bold text-slate-100 italic">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
