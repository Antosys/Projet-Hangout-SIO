
import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { eventService } from "@/services/event.service";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  photo?: string | null;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    eventService.getRandomEvents()
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement events:", err);
        setLoading(false);
      });
  }, []);

  const placeholders = Array.from({ length: 3 });

  return (
    <section id="evenements" className="py-12 md:py-20 max-w-6xl mx-auto flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-bold text-black/80 mb-9 text-center"
      >
        Les événements populaires
      </motion.h2>

      <div className="w-full flex flex-wrap justify-center gap-8 min-h-[160px]">
        {loading || !events ? (
          placeholders.map((_, idx) => (
            <EventCard key={idx} title="" description="" location="" loading />
          ))
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() => navigate(`/events/${ev.id}`)}
            >
              <EventCard
                title={ev.title}
                description={ev.description}
                date={ev.date}
                location={ev.location}
                photo={ev.photo ? `${ev.photo}` : undefined}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default EventsSection;

