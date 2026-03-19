import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "@/services/auth.service";
import { locationService } from "@/services/location.service";
import { uploadService } from "@/services/upload.service";
import { eventService } from "@/services/event.service";
import PhotoDropzone from '@/components/PhotoDropzone';

import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
} from "lucide-react";

const CreerEvenement = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  // ✅ Formulaire propre avec photos
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location_id: "",
    max_people: "",
    date: "",
    price: "",
    photos: [] as string[],
  });

  // ======================================================
  // ✅ AUTH + LOAD CITIES
  // ======================================================
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        // Vérification rôle
        const authResponse = await authService.verifyToken();

        if (!authResponse.ok) {
          navigate("/");
          return;
        }

        const authData = await authResponse.json();

        if (
          authData.user.role !== "organisateur" &&
          authData.user.role !== "admin"
        ) {
          navigate("/");
          return;
        }

        // Chargement villes
        const citiesResponse = await locationService.getLocations();
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          setCities(citiesData);
        }
      } catch (err) {
        console.error(err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  // ======================================================
  // ✅ HANDLE INPUTS
  // ======================================================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================================
  // ✅ UPLOAD SINGLE IMAGE (same logic as ModifierEvenement)
  // ======================================================
  const uploadImage = async (file: File, filename?: string): Promise<string> => {
    const fd = new FormData();
    fd.append("image", file); // ⚠️ backend expects "image"

    const response = await uploadService.uploadImage(fd);

    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement de l'image.");
    }

    const data = await response.json();
    return data.filename;
  };

  // ======================================================
  // ✅ SUBMIT EVENT
  // ======================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await eventService.createEvent({
        ...formData,
        max_people: parseInt(formData.max_people),
        price: parseFloat(formData.price) || 0,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erreur création événement");
      }

      const data = await response.json();
      navigate(`/events/${data.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // ✅ LOADING SCREEN
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ======================================================
  // ✅ UI DESIGN ULTRA CLEAN
  // ======================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8">

          {/* HEADER */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Créer un événement
          </h1>
          <p className="text-gray-600 mb-8">
            Partagez votre passion et rassemblez les bonnes personnes
          </p>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6">
              {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre *
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Apéro Networking"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* DATE */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* CITY */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ville *
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="">Sélectionnez une ville</option>
                  {cities.map((city, i) => (
                    <option key={i} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* MAX + PRICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Participants max *
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="number"
                    name="max_people"
                    value={formData.max_people}
                    onChange={handleChange}
                    required
                    min={1}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prix (€)
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

            </div>

            {/* PHOTOS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Photos
              </label>
              <PhotoDropzone
                photos={formData.photos}
                setPhotos={(photos) => setFormData((prev) => ({ ...prev, photos }))}
                uploadImage={uploadImage}
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4 pt-4">

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-2xl hover:bg-gray-200 transition"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? "Création..." : "Créer l'événement"}
              </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreerEvenement;
