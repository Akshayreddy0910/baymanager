import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useRef } from "react"
import { Wrench, Calendar, Car, CreditCard, Users, BarChart3 } from "lucide-react"

export default function Hero3DScene() {
  // ----- MOUSE PARALLAX SETUP -----
  // Create motion values for mouse X and Y position (0 to 1 relative to container)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  
  // Use spring for smooth damped motion (not jerky/robotic)
  // stiffness/damping/mass control the physics feel
  const springConfig = { stiffness: 100, damping: 20, mass: 0.5 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)
  
  // Transform mouse position into rotation values for dashboard panel
  // We map the 0-1 range to specific degree outputs
  // Mouse at left (0) = rotate Y -20deg, right (1) = rotate Y -10deg
  const dashboardRotateY = useTransform(smoothX, [0, 1], [-20, -10])
  // Mouse at top (0) = rotate X 12deg, bottom (1) = rotate X 4deg
  const dashboardRotateX = useTransform(smoothY, [0, 1], [12, 4])
  
  // Floating card parallax: smaller translation shifts (max 8 pixels)
  const cardShiftX = useTransform(smoothX, [0, 1], [-8, 8])
  const cardShiftY = useTransform(smoothY, [0, 1], [-8, 8])
  
  const containerRef = useRef(null)
  
  // Mouse move handler — calculates relative position percentage
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mouseX.set(x)
    mouseY.set(y)
  }
  
  // Return everything to rest position (0.5 center) when mouse leaves container
  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
  }
  
  // Floating cards data - Icons and positions for the orbiting elements
  const floatingCardsData = [
    { icon: Wrench,     label: "Job Cards",  top: "-8%",  left: "-12%", delay: 0.8,  floatDuration: 3.2 },
    { icon: Calendar,   label: "Bookings",   top: "-5%",  right: "-10%",delay: 1.0,  floatDuration: 3.8 },
    { icon: Car,        label: "Vehicles",   bottom: "-8%",left: "-10%",delay: 1.2,  floatDuration: 3.5 },
    { icon: CreditCard, label: "Payments",   bottom: "-10%",right: "-12%",delay: 1.4,  floatDuration: 4.0 },
  ]

  // Component rendering
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden"
      // perspective must be on parent for child 3D rotations to look "deep"
      style={{ perspective: "1200px" }}
    >
      {/* ===== BACKGROUND GLOW ORB ===== */}
      {/* pointer-events-none ensures the glowing aura doesn't block mouse move events */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4, rotate: 360 }}
        transition={{
          opacity: { duration: 2, ease: "easeOut" },
          rotate: { duration: 30, repeat: Infinity, ease: "linear" }
        }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[300px] lg:w-[450px] h-[300px] lg:h-[450px] rounded-full bg-gradient-to-br 
                        from-cyan-400 via-blue-500 to-purple-500 blur-3xl opacity-40" />
      </motion.div>
      
      {/* ===== TILTED DASHBOARD MOCKUP ===== */}
      <motion.div
        // Entrance animation: scale up and fade in
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        style={{
          // Apply mouse-based rotations
          rotateY: dashboardRotateY,
          rotateX: dashboardRotateX,
          // preserve-3d allows nested children to maintain their own 3D placement
          transformStyle: "preserve-3d",
        }}
        className="relative w-[340px] lg:w-[380px] h-[300px] lg:h-[340px] rounded-2xl border border-cyan-400/20 
                   bg-gradient-to-br from-slate-900 to-slate-950 
                   shadow-2xl shadow-cyan-500/30 overflow-hidden scale-90 lg:scale-100"
      >
        {/* Dashboard top bar UI */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900/80">
          <div className="flex gap-1.5 text-center">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 bg-slate-800 rounded-md px-3 py-1 ml-2">
            <span className="text-[10px] text-slate-500 font-mono">baymanager.app/admin</span>
          </div>
        </div>
        
        {/* Main Dashboard Content Mockup */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 
                            flex items-center justify-center">
              <Wrench size={12} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-slate-200">BayManager</span>
            <span className="ml-auto text-[10px] text-slate-500">Admin</span>
          </div>
          
          {/* Card stats built for visual completeness */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2">
              <Users size={12} className="text-cyan-400 mb-1" />
              <div className="text-sm font-bold text-slate-100">342</div>
              <div className="text-[9px] text-slate-500">Customers</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2">
              <Calendar size={12} className="text-blue-400 mb-1" />
              <div className="text-sm font-bold text-slate-100">89</div>
              <div className="text-[9px] text-slate-500">Bookings</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-2">
              <BarChart3 size={12} className="text-emerald-400 mb-1" />
              <div className="text-sm font-bold text-slate-100">$1.2K</div>
              <div className="text-[9px] text-slate-500">Revenue</div>
            </div>
          </div>
          
          {/* Animated fake chart bars */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 mb-3">
            <div className="flex items-end gap-1.5 h-12">
              {(() => {
                const bars = [];
                const heights = [60, 80, 45, 90, 70, 85, 55];
                for (let i = 0; i < heights.length; i++) {
                  bars.push(
                    <motion.div
                      key={i}
                      // Staggered entrance height animation
                      initial={{ height: 0 }}
                      animate={{ height: `${heights[i]}%` }}
                      transition={{ duration: 0.5, delay: 1.5 + (i * 0.1) }}
                      className="flex-1 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm"
                    />
                  );
                }
                return bars;
              })()}
            </div>
          </div>
          
          {/* Table list mockup */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/40 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[10px] text-slate-300 flex-1">Job #2047</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">Done</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/40 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-slate-300 flex-1">Job #2048</span>
              <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-800/40 rounded-md">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span className="text-[10px] text-slate-300 flex-1">Job #2049</span>
              <span className="text-[9px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">New</span>
            </div>
          </div>
        </div>
        
        {/* Glow accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r 
                        from-transparent via-cyan-400 to-transparent opacity-60" />
      </motion.div>
      
      {/* ===== FLOATING ICON CARDS ===== */}
      {(() => {
        const cards = [];
        for (let i = 0; i < floatingCardsData.length; i++) {
          const card = floatingCardsData[i];
          const Icon = card.icon;
          cards.push(
            // PARALLAX WRAPPER: Handles cursor-based X/Y shift
            <motion.div
              key={i}
              style={{
                position: "absolute",
                top: card.top,
                left: card.left,
                right: card.right,
                bottom: card.bottom,
                x: cardShiftX,
                y: cardShiftY,
              }}
              // Bounce entrance animation
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                opacity: { duration: 0.5, delay: card.delay },
                scale:   { duration: 0.5, delay: card.delay, ease: "backOut" },
              }}
            >
              {/* FLOAT WRAPPER: Handles the continuous vertical bobbing effect */}
              {/* Nested divs are needed because both parallax and bobbing try to control 'y' */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: card.floatDuration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: card.delay
                }}
                className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-slate-800/60 backdrop-blur-xl 
                           border border-cyan-400/30 shadow-lg shadow-cyan-500/20 
                           flex items-center justify-center group"
              >
                <Icon size={24} className="text-cyan-400 group-hover:text-white transition-colors" strokeWidth={2} />
              </motion.div>
            </motion.div>
          );
        }
        return cards;
      })()}
    </div>
  )
}
