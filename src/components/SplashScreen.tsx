/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ClipboardCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-indigo-600 flex flex-col items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut"
        }}
        className="bg-white p-6 rounded-[2.5rem] shadow-2xl mb-6"
      >
        <ClipboardCheck size={64} className="text-indigo-600" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white text-4xl font-black tracking-tighter"
      >
        Attendly
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 0.6 }}
        className="text-white/80 text-sm mt-2 font-medium"
      >
        Attendance Management Made Simple
      </motion.p>

      <div className="absolute bottom-12">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-2 h-2 bg-white rounded-full mx-auto"
        />
      </div>
    </div>
  );
};
