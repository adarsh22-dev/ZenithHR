import React from 'react';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-[#5A5A40]/10 text-[#5A5A40] rounded-[32px] flex items-center justify-center"
      >
        <Construction size={48} />
      </motion.div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          This module is currently under development. We're working hard to bring you the best experience for managing {title.toLowerCase()}.
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-all"
      >
        <ArrowLeft size={18} />
        Go Back
      </button>
    </div>
  );
}
