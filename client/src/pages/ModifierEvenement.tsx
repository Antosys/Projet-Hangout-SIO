import { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import PhotoDropzone from '@/components/PhotoDropzone';
import { eventService } from '@/services/event.service';
import { uploadService } from '@/services/upload.service';
import { EventForm } from '@/types';

export default function ModifierEvenement() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<EventForm>({
    title: '',
    description: '',
    location_id: '',
    max_people: '',
    date: '',
    price: '',
    photos: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, filename?: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await uploadService.uploadImage(formData);

  if (!response.ok) {
    throw new Error('Erreur lors du téléchargement de l\'image.');
  }

  const data = await response.json();

  return `${data.filename}`;
};




  useEffect(() => {
    async function fetchEvent() {
      setLoading(true);
      setError(null);
      try {
        const res = await eventService.getEvent(id!);

        if (!res.ok) {
          throw new Error("Erreur lors du chargement de l'événement.");
        }

        const data = await res.json();

        setForm({
          title: data.title || '',
          description: data.description || '',
          location_id: data.location_id || '',
          max_people: data.max_people || '',
          date: data.date ? new Date(data.date).toISOString().slice(0, 16) : '',
          price: data.price || '',
          photos: data.photos || [],
        });
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchEvent();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await eventService.updateEvent(id!, { ...form, max_people: form.max_people ? parseInt(form.max_people as string) : null, price: form.price ? parseFloat(form.price as string) : 0 });

      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour de l'événement.");
      }

      await res.json();
      navigate(`/events/${id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-xl mt-6"
    >
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
        Modifier l&apos;événement
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">ID de localisation</label>
          <input
            type="number"
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block font-medium text-gray-700 mb-1">Max participants</label>
            <input
              type="number"
              name="max_people"
              value={form.max_people}
              onChange={handleChange}
              min={1}
              className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="block font-medium text-gray-700 mb-1">Prix (€)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min={0}
              step="0.01"
              className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-1">Date et heure</label>
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700 mb-2">Photos</label>
          <PhotoDropzone
            photos={form.photos}
            setPhotos={(photos) => setForm(prev => ({ ...prev, photos }))}
            uploadImage={uploadImage}
          />
        </div>

        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </motion.div>
  );
}
