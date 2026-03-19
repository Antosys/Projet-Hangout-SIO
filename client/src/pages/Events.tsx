import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Header from '../components/Header';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { eventService } from '@/services/event.service';
import { Event } from '@/types';
import { buildUploadUrl } from '@/lib/uploads';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [city, setCity] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      const search = queryParams.get('search') || searchTerm;
      const cityParam = queryParams.get('city') || city;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: search,
        city: cityParam,
        sort: sortConfig.key,
        order: sortConfig.direction
      });

      const response = await eventService.getEvents(params);

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des événements');
      }

      const data = await response.json();
      setEvents(data.events || []);
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, sortConfig, location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/events?search=${searchTerm}&city=${city}`);
  };

  const requestSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setDropdownOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd]">
      <Header isAuthenticated={!!localStorage.getItem('token')} />

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Découvrez nos événements
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Participez à des expériences uniques et rencontrez des personnes partageant vos passions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/50 border-white/20 focus:border-blue-300 rounded-full"
              />
            </div>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full md:w-48 bg-white/50 border-white/20 rounded-full">
                <SelectValue placeholder="Ville" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paris">Paris</SelectItem>
                <SelectItem value="Lyon">Lyon</SelectItem>
                <SelectItem value="Marseille">Marseille</SelectItem>
                <SelectItem value="Nice">Nice</SelectItem>
                <SelectItem value="Bordeaux">Bordeaux</SelectItem>
                <SelectItem value="Lille">Lille</SelectItem>
                <SelectItem value="Toulouse">Toulouse</SelectItem>
                <SelectItem value="Nantes">Nantes</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative z-50" ref={dropdownRef}>
              <Button
                type="button"
                className="bg-white/50 border border-white/20 rounded-full px-4 py-2 flex items-center justify-center"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {sortConfig.key === 'date' ? 'Date' : 'Prix'}
                {sortConfig.direction === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
              {dropdownOpen && (
                <div className="absolute z-50 mt-2 w-48 bg-white rounded-lg shadow-lg">
                  <Button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                    onClick={() => requestSort('date')}
                  >
                    Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Button>
                  <Button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                    onClick={() => requestSort('price')}
                  >
                    Prix {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
              <Search className="w-4 h-4 mr-2" />
              Rechercher
            </Button>
          </form>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-white/20 animate-pulse rounded-xl">
                <div className="h-48 bg-gray-200 rounded-t-xl" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 pt-12 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map((event) => (
              <motion.div key={event.id} variants={cardVariants}>
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl overflow-hidden">
                  {event.photos && event.photos.length > 0 && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={buildUploadUrl(event.photos[0]) || ''}
                        alt="Image événement"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-sm font-bold text-green-600">
                          {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                        </span>
                      </div>
                    </div>
                  )}

                  <CardHeader className={event.photos && event.photos.length > 0 ? 'pb-3' : ''}>
                    {(!event.photos || event.photos.length === 0) && (
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-green-600">
                          {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                        </span>
                      </div>
                    )}
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {event.participants}/{event.maxParticipants} participants
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          En savoir plus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && events.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center items-center mt-12 gap-2"
          >
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-white/50 border-white/20 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-white/50 border-white/20 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {!loading && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Events;
