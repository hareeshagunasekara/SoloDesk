import React from 'react';
import { motion } from 'framer-motion';

const BlurText = ({ 
  text, 
  delay = 0, 
  animateBy = "words", 
  direction = "top", 
  onAnimationComplete, 
  className = "",
  duration = 0.8,
  stagger = 0.1
}) => {
  const words = text.split(' ');
  const letters = text.split('');

  const getVariants = (type) => {
    const baseVariants = {
      hidden: { 
        opacity: 0,
        filter: "blur(10px)",
        scale: 0.8
      },
      visible: { 
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        transition: {
          duration: duration,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    };

    const directionVariants = {
      top: { y: -20 },
      bottom: { y: 20 },
      left: { x: -20 },
      right: { x: 20 }
    };

    return {
      hidden: {
        ...baseVariants.hidden,
        ...directionVariants[direction]
      },
      visible: {
        ...baseVariants.visible,
        ...directionVariants[direction]
      }
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay / 1000,
        staggerChildren: stagger
      }
    }
  };

  const renderContent = () => {
    if (animateBy === "words") {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onAnimationComplete={onAnimationComplete}
          className={`flex flex-wrap justify-center ${className}`}
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              variants={getVariants("words")}
              className="mr-2"
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      );
    } else if (animateBy === "letters") {
      return (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onAnimationComplete={onAnimationComplete}
          className={`flex flex-wrap justify-center ${className}`}
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              variants={getVariants("letters")}
              className={letter === ' ' ? 'mr-2' : ''}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      );
    } else {
      return (
        <motion.div
          variants={getVariants("text")}
          initial="hidden"
          animate="visible"
          transition={{ delay: delay / 1000 }}
          onAnimationComplete={onAnimationComplete}
          className={className}
        >
          {text}
        </motion.div>
      );
    }
  };

  return renderContent();
};

export default BlurText; 