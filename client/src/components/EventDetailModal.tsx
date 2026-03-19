
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const EventDetailModal = ({ open, onClose, onConfirm, price }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmation</h2>
        <p className="text-gray-600 mb-6">
          Souhaitez-vous vous inscrire à cet événement{price > 0 ? ` pour ${price.toFixed(2)} €` : ' gratuitement'} ?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-full">
            Annuler
          </Button>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 rounded-full" onClick={onConfirm}>
            Confirmer
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default EventDetailModal;

