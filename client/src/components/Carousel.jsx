import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Settings,
  Users,
  FolderOpen,
  Send,
  CreditCard,
  BarChart3,
} from "lucide-react";

const DEFAULT_ITEMS = [
  {
    title: "Set Up Your Space",
    description: "Style it your way. Add your logo, brand colors, and preferences.",
    id: 1,
    icon: <Settings className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Add Your Clients",
    description: "Keep everything — and everyone — in one smart place.",
    id: 2,
    icon: <Users className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Create Projects & Tasks",
    description: "Plan it, track it, crush it. Every step, all in sync.",
    id: 3,
    icon: <FolderOpen className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Share & Collaborate",
    description: "One sleek hub for files, feedback, and updates.",
    id: 4,
    icon: <Send className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Send Invoices & Get Paid",
    description: "Professional, fast, and friction-free payments.",
    id: 5,
    icon: <CreditCard className="h-[16px] w-[16px] text-white" />,
  },
  {
    title: "Stay Effortlessly in Control",
    description: "SoloDesk keeps things moving — so you can focus on what matters.",
    id: 6,
    icon: <BarChart3 className="h-[16px] w-[16px] text-white" />,
  },
];

const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 300;
const GAP = 24;
const SPRING_OPTIONS = { type: "spring", stiffness: 200, damping: 25, mass: 0.8 };

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
}) {
  // Responsive width calculation
  const getResponsiveWidth = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return Math.min(baseWidth, width - 32); // Mobile
      if (width < 1024) return Math.min(baseWidth, width * 0.8); // Tablet
      return baseWidth; // Desktop
    }
    return baseWidth;
  };

  const responsiveWidth = getResponsiveWidth();
  const containerPadding = 24;
  const itemWidth = responsiveWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;

  const carouselItems = loop ? [...items, items[0]] : items;
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const containerRef = useRef(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (autoplay && (!pauseOnHover || !isHovered)) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev === items.length - 1 && loop) {
            return prev + 1;
          }
          if (prev === carouselItems.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoplayDelay);
      return () => clearInterval(timer);
    }
  }, [
    autoplay,
    autoplayDelay,
    isHovered,
    loop,
    items.length,
    carouselItems.length,
    pauseOnHover,
  ]);

  const effectiveTransition = isResetting ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationComplete = () => {
    if (loop && currentIndex === carouselItems.length - 1) {
      setIsResetting(true);
      x.set(0);
      setCurrentIndex(0);
      setTimeout(() => setIsResetting(false), 50);
    }
  };

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD) {
      if (loop && currentIndex === items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex((prev) => Math.min(prev + 1, carouselItems.length - 1));
      }
    } else if (offset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD) {
      if (loop && currentIndex === 0) {
        setCurrentIndex(items.length - 1);
      } else {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      }
    }
  };

  const dragProps = loop
    ? {}
    : {
      dragConstraints: {
        left: -trackItemOffset * (carouselItems.length - 1),
        right: 0,
      },
    };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden p-4 sm:p-6 ${round
        ? "rounded-full border border-white"
        : "rounded-[24px] sm:rounded-[32px] border border-gray-300/20 bg-gradient-to-br from-gray-100/5 via-gray-200/8 to-gray-100/5 backdrop-blur-sm"
        }`}
      style={{
        width: `${responsiveWidth}px`,
        maxWidth: '100%',
        ...(round && { height: `${responsiveWidth}px` }),
      }}
    >
      <motion.div
        className="flex"
        drag="x"
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${currentIndex * trackItemOffset + itemWidth / 2}px 50%`,
          x,
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationComplete={handleAnimationComplete}
      >
        {carouselItems.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const outputRange = [90, 0, -90];
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const rotateY = useTransform(x, range, outputRange, { clamp: false });
          return (
            <motion.div
              key={index}
              className={`relative shrink-0 flex flex-col ${round
                ? "items-center justify-center text-center bg-[#060010] border-0"
                : "items-start justify-between bg-gradient-to-br from-gray-100/10 via-gray-200/15 to-gray-100/10 backdrop-blur-sm border border-gray-300/20 rounded-[16px] hover:border-gray-400/30 hover:shadow-xl transition-all duration-500 ease-out"
                } overflow-hidden cursor-grab active:cursor-grabbing`}
              style={{
                width: itemWidth,
                height: round ? itemWidth : "100%",
                rotateY: rotateY,
                ...(round && { borderRadius: "50%" }),
              }}
              transition={{ ...effectiveTransition, duration: 0.6 }}
              whileHover={{ scale: 1.02, z: 10 }}
            >
              <div className={`${round ? "p-0 m-0" : "mb-4 p-4 sm:p-6"}`}>
                <span className="flex h-[28px] w-[28px] sm:h-[32px] sm:w-[32px] items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-500 shadow-lg">
                  {item.icon}
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="mb-2 font-black text-lg sm:text-xl text-gray-50">
                  {item.title}
                </div>
                <p className="text-xs sm:text-sm text-gray-300/80 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <div
        className={`flex w-full justify-center ${round ? "absolute z-20 bottom-12 left-1/2 -translate-x-1/2" : ""
          }`}
      >
        <div className="mt-4 sm:mt-6 flex w-[140px] sm:w-[180px] justify-between px-4 sm:px-8">
          {items.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full cursor-pointer transition-all duration-300 ${currentIndex % items.length === index
                ? round
                  ? "bg-white"
                  : "bg-gray-400"
                : round
                  ? "bg-[#555]"
                  : "bg-gray-600/40"
                }`}
              animate={{
                scale: currentIndex % items.length === index ? 1.3 : 1,
              }}
              onClick={() => setCurrentIndex(index)}
              transition={{ duration: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 