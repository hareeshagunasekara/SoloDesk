import React from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '../layouts/PublicLayout';

const About = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
              About SoloDesk
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              We're on a mission to transform how organizations manage their workspaces, 
              making desk management smarter, more efficient, and more human.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="prose prose-lg max-w-none"
            >
              <h2 className="text-3xl font-bold text-card-foreground mb-6">
                Our Story
              </h2>
              <p className="text-muted-foreground mb-6">
                SoloDesk was born from a simple observation: traditional workspace management 
                was complex, inefficient, and disconnected from the modern workplace. We saw 
                an opportunity to create something better.
              </p>
              <p className="text-muted-foreground mb-6">
                Founded in 2024, our team of workspace enthusiasts and technology experts 
                came together to build a solution that would make desk management as simple 
                as it should be.
              </p>
              
              <h2 className="text-3xl font-bold text-card-foreground mb-6 mt-12">
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-6">
                We believe that great workspaces start with great management. Our mission 
                is to provide organizations with the tools they need to create flexible, 
                efficient, and employee-friendly workspace environments.
              </p>
              
              <h2 className="text-3xl font-bold text-card-foreground mb-6 mt-12">
                Our Values
              </h2>
              <ul className="text-muted-foreground space-y-3">
                <li><strong className="text-card-foreground">Simplicity:</strong> We believe the best solutions are the simplest ones.</li>
                <li><strong className="text-card-foreground">Efficiency:</strong> Every feature we build is designed to save time and reduce complexity.</li>
                <li><strong className="text-card-foreground">User-First:</strong> We put the needs of workspace managers and employees first.</li>
                <li><strong className="text-card-foreground">Innovation:</strong> We continuously explore new ways to improve workspace management.</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default About; 