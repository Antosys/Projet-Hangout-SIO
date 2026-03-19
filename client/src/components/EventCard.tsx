
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { buildUploadUrl } from '@/lib/uploads';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  photo?: string | null;
  loading?: boolean;
}

const EventCard = ({ id, title, date, description, location, photo, loading }: EventCardProps) => {
  if (loading) {
    return (
      <div className="relative bg-white/70 backdrop-blur-md border border-white/30 rounded-xl shadow-lg p-6 animate-pulse min-h-[280px] min-w-[240px] w-full max-w-xs mx-auto flex flex-col gap-3 justify-center">
        <div className="h-40 w-full bg-gray-200/50 rounded mb-3" />
        <div className="h-5 w-32 bg-gray-200/50 rounded mb-2" />
        <div className="h-4 w-24 bg-gray-200/40 rounded mb-1" />
        <div className="h-3 w-20 bg-gray-200/30 rounded" />
      </div>
    );
  }

  return (
    <Link to={`/events/${id}`} className="w-full max-w-xs">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white/80 backdrop-blur-md border border-white/30 rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[280px]"
      >
        {photo ? (
          <img
            src={buildUploadUrl(photo) || ''}
            alt={title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            Pas d’image
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col">
          <h4 className="text-lg font-bold text-[#388ff7]">{title}</h4>
          <div className="text-black/60 text-base mt-1">{description}</div>
          <div className="text-black/50 text-sm mt-auto">{location}</div>
        </div>
      </motion.div>
    </Link>
  );
};

export default EventCard;


