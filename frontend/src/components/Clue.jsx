// frontend/src/components/Clue.jsx
import React from 'react';
import { motion } from 'framer-motion';

const Clue = ({ text, index }) => {
  return (
    <motion.div 
      className="clue-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.2 }}
    >
      <div className="flex">
        <div className="clue-number font-bold mr-2">{index + 1}.</div>
        <div className="clue-text">{text}</div>
      </div>
    </motion.div>
  );
};

export default Clue;