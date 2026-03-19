import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '../components/Header';
import { useToast } from '@/hooks/use-toast';
import { eventService } from '@/services/event.service';
import { Event } from '@/types';
import { buildUploadUrl } from '@/lib/uploads';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);

 useEffect(() => {
  const fetchEvent = async () => {
    try {
      const res = await eventService.getEvent(id!);
      if (!res.ok) throw new Error('Erreur lors du chargement de l\'événement.');
      const data = await res.json();
      setEvent(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : "Impossible de charger l'événement.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  fetchEvent();
}, [id, navigate, toast]);




  const handleJoin = async () => {
    setJoining(true);
    try {
      const res = await eventService.joinEvent(id!);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de l\'inscription.');
      }
      
      const result = await res.json();
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast({
          title: 'Inscription confirmée',
          description: "Vous êtes inscrit à l'événement !",
        });
        setConfirming(false);
        setEvent(prev => prev ? { ...prev, isParticipant: true, participantsCount: (prev.participantsCount || 0) + 1 } : null);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    setDeleting(true);
    try {
      const res = await eventService.deleteEvent(id!);
      if (res.status !== 204) {
        const err = await res.json();
        throw new Error(err.message || 'Erreur lors de la suppression.');
      }
      toast({
        title: 'Événement supprimé',
        description: 'L\'événement a bien été supprimé.',
      });
      navigate('/events' + location.search);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const renderBentoPhotos = (photos: string[]) => {
    if (!photos || !Array.isArray(photos) || photos.length === 0) return null;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 rounded-xl overflow-hidden">
        {photos.map((photo, idx) => (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-lg ${
              idx === 0 ? 'md:col-span-2 md:row-span-2' :
              idx === 1 || idx === 2 ? 'md:col-span-1' :
              idx === 3 ? 'md:col-span-1' :
              'md:col-span-1'
            }`}
          >
            <img
              src={buildUploadUrl(photo) || ''}
              alt={`Photo événement ${idx + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              style={{
                minHeight: idx === 0 ? '300px' : '150px',
                aspectRatio: idx === 0 ? '2/1' : '1/1'
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center pt-32 text-gray-600">Chargement...</div>;
  if (!event) return <div className="text-center pt-32 text-gray-600">Événement introuvable</div>;

  const isJoined = event.isParticipant;
  const canEditOrDelete = event.isOrganizer || event.organizer?.role === 'admin' || event.userRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/events' + location.search)}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </Button>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-3xl shadow-md bg-white">
            {event.photos && Array.isArray(event.photos) && event.photos.length > 0 && (
              <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
                <img
                  src={buildUploadUrl(event.photos[0]) || ''}
                  alt="Image événement"
                  className="w-full h-full object-cover"
                />
                {isJoined && (
                  <div className="absolute top-4 right-4 flex items-center bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Inscrit
                  </div>
                )}
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between mb-1">
                <CardTitle className="text-3xl font-semibold text-gray-900">{event.title}</CardTitle>
                {isJoined && !event.photos?.length && (
                  <div className="flex items-center text-green-600 font-medium text-sm gap-1">
                    <CheckCircle className="w-5 h-5" />
                    Inscrit
                  </div>
                )}
              </div>
              <CardDescription className="text-gray-700 whitespace-pre-wrap mb-4">{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-gray-700">
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Calendar className="w-5 h-5" />
                <time dateTime={event.date}>
                  {new Date(event.date).toLocaleString('fr-FR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <MapPin className="w-5 h-5" />
                <span>
                  {event.localisation?.address
                    ? `${event.localisation.address}, `
                    : ''}
                  {event.localisation?.city || 'Ville non précisée'} ({event.localisation?.postal_code || 'Code postal inconnu'})
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 text-sm">
                <Users className="w-5 h-5" />
                <span>
                  {event.participantsCount} / {event.max_people || '∞'} participants
                </span>
              </div>

              {event.photos && Array.isArray(event.photos) && event.photos.length > 1 && (
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-gray-900">Galerie photos</h4>
                  {renderBentoPhotos(event.photos.slice(1))}
                </div>
              )}
              {!isJoined && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setConfirming(true)}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 shadow-md transition"
                  >
                    {event.price > 0 ? `Participer - ${event.price.toFixed(2)}€` : 'Participer'}
                  </Button>
                </div>
              )}
              {(canEditOrDelete) && (
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/events/edit/${id}`)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 border border-blue-600"
                  >
                    <Edit2 className="w-5 h-5" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Confirmer votre inscription</h2>
              <p className="mb-6 text-gray-700">
                {event.price > 0
                  ? `Un paiement de ${event.price.toFixed(2)}€ est requis.`
                  : "Cet événement est gratuit, une simple confirmation suffit."}
              </p>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setConfirming(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleJoin}
                  disabled={joining}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {joining ? 'Chargement...' : 'Confirmer'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default EventDetail;
