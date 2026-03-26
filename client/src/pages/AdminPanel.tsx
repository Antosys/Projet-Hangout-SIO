import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { adminService } from '@/services/admin.service';

type AdminTab = 'overview' | 'users' | 'events' | 'inscriptions' | 'localisations';

type AdminOverview = {
  users: { total: number; admins: number; organizers: number; participants: number };
  events: { total: number };
  inscriptions: { total: number };
  payments: { paidCount: number; totalRevenue: number };
  highlights: Array<{ id: number; title: string; date: string; maxPeople: number; participantsCount: number }>;
};

type AdminUser = {
  id: number;
  prenom: string;
  nom: string;
  username: string;
  email: string;
  role: 'admin' | 'organizer' | 'participant';
  createdAt?: string;
};

type AdminEvent = {
  id: number;
  title: string;
  description: string;
  date: string;
  price: number;
  maxPeople: number;
  participantsCount: number;
  organizer?: { id: number; username: string; email: string };
  location?: { city?: string; postal_code?: string };
};

type AdminInscription = {
  id: number;
  status: string;
  createdAt: string;
  user?: { id: number; username: string; email: string };
  event?: { id: number; title: string; date: string; price: number };
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [inscriptions, setInscriptions] = useState<AdminInscription[]>([]);

  const [usersSearch, setUsersSearch] = useState('');
  const [eventsSearch, setEventsSearch] = useState('');
  const [inscriptionsSearch, setInscriptionsSearch] = useState('');

  const [createUserForm, setCreateUserForm] = useState({ nom: '', prenom: '', username: '', email: '', password: '', role: 'participant' });
  const [createUserMsg, setCreateUserMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const [createLocForm, setCreateLocForm] = useState({ address: '', city: '', postal_code: '' });
  const [createLocMsg, setCreateLocMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const hasLoadedOnce = useRef(false);

  const parseRateLimitError = async (res: Response, fallback: string) => {
    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after');
      return `Limite de requêtes atteinte. ${retryAfter ? `Réessayez dans ${retryAfter}s.` : 'Réessayez dans quelques instants.'}`;
    }

    const data = await res.json().catch(() => ({}));
    return data?.message || fallback;
  };

  const loadOverview = async () => {
    const res = await adminService.getOverview();
    if (!res.ok) {
      throw new Error(await parseRateLimitError(res, 'Impossible de charger les statistiques admin.'));
    }
    const data = await res.json();
    setOverview(data);
  };

  const loadUsers = async () => {
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (usersSearch.trim()) {
      params.set('search', usersSearch.trim());
    }

    const res = await adminService.getUsers(params);
    if (!res.ok) {
      throw new Error(await parseRateLimitError(res, 'Impossible de charger les utilisateurs.'));
    }
    const data = await res.json();
    setUsers(data.users || []);
  };

  const loadEvents = async () => {
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (eventsSearch.trim()) {
      params.set('search', eventsSearch.trim());
    }

    const res = await adminService.getEvents(params);
    if (!res.ok) {
      throw new Error(await parseRateLimitError(res, 'Impossible de charger les événements.'));
    }
    const data = await res.json();
    setEvents(data.events || []);
  };

  const loadInscriptions = async () => {
    const params = new URLSearchParams({ page: '1', limit: '50' });
    if (inscriptionsSearch.trim()) {
      params.set('search', inscriptionsSearch.trim());
    }

    const res = await adminService.getInscriptions(params);
    if (!res.ok) {
      throw new Error(await parseRateLimitError(res, 'Impossible de charger les inscriptions.'));
    }
    const data = await res.json();
    setInscriptions(data.inscriptions || []);
  };

  const verifyAdminAndLoad = async () => {
    setIsChecking(true);
    setError(null);
    try {
      const profileRes = await fetch('https://projet-hangout-sio.onrender.com/api/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      if (!profileRes.ok) {
        throw new Error('Session invalide.');
      }

      const profile = await profileRes.json();
      if (profile.role !== 'admin') {
        throw new Error('Accès refusé : droits admin requis.');
      }

      // Sequential initial loading prevents burst requests and reduces 429 risk.
      await loadOverview();
      await loadUsers();
      await loadEvents();
      await loadInscriptions();
    } catch (e: any) {
      setError(e.message || 'Erreur admin.');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (hasLoadedOnce.current) {
      return;
    }
    hasLoadedOnce.current = true;
    verifyAdminAndLoad();
  }, []);

  const activeRowsCount = useMemo(() => {
    if (tab === 'users') return users.length;
    if (tab === 'events') return events.length;
    if (tab === 'inscriptions') return inscriptions.length;
    return 0;
  }, [tab, users.length, events.length, inscriptions.length]);

  const handleDeleteUser = async (id: number) => {
    const res = await adminService.deleteUser(id);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Suppression utilisateur échouée.');
    }
    await loadUsers();
    await loadOverview();
  };

  const handleRoleChange = async (id: number, role: 'admin' | 'organizer' | 'participant') => {
    const res = await adminService.updateUserRole(id, role);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || 'Mise à jour du rôle échouée.');
    }
    await loadUsers();
  };

  const handleDeleteEvent = async (id: number) => {
    const res = await adminService.deleteEvent(id);
    if (!res.ok) {
      throw new Error('Suppression événement échouée.');
    }
    await loadEvents();
    await loadOverview();
  };

  const handleDeleteInscription = async (id: number) => {
    const res = await adminService.deleteInscription(id);
    if (!res.ok) {
      throw new Error('Suppression inscription échouée.');
    }
    await loadInscriptions();
    await loadOverview();
  };

  const handleCreateUser = async () => {
    setCreateUserMsg(null);
    try {
      const res = await adminService.createUser(createUserForm);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Création utilisateur échouée.');
      setCreateUserMsg({ type: 'success', text: 'Utilisateur créé avec succès.' });
      setCreateUserForm({ nom: '', prenom: '', username: '', email: '', password: '', role: 'participant' });
      await loadUsers();
      await loadOverview();
    } catch (e: any) {
      setCreateUserMsg({ type: 'error', text: e.message || 'Erreur.' });
    }
  };

  const handleCreateLocalisation = async () => {
    setCreateLocMsg(null);
    try {
      const res = await adminService.createLocalisation(createLocForm);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Création localisation échouée.');
      setCreateLocMsg({ type: 'success', text: `Ville "${createLocForm.city}" créée avec succès.` });
      setCreateLocForm({ address: '', city: '', postal_code: '' });
    } catch (e: any) {
      setCreateLocMsg({ type: 'error', text: e.message || 'Erreur.' });
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] text-slate-900 flex items-center justify-center">
        <p>Chargement du panel admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl font-bold">Accès admin refusé</h1>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => navigate('/profile')}
            className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white"
          >
            Retour au profil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e4f1ff] via-white to-[#d8eafd] text-slate-900">
      <Header />
      <div className="pt-24 pb-10 px-4 max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/80 bg-white/85 backdrop-blur-xl p-6 shadow-[0_10px_45px_rgba(96,141,195,0.16)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Centre d'administration</h1>
              <p className="text-slate-600">Gestion complète des utilisateurs, événements, inscriptions et statistiques.</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2 text-sm text-blue-700">
              {tab === 'overview' ? 'Vue globale' : tab === 'localisations' ? 'Créer une ville' : `${activeRowsCount} éléments affichés`}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['overview', 'users', 'events', 'inscriptions', 'localisations'] as AdminTab[]).map((name) => (
            <button
              key={name}
              onClick={() => setTab(name)}
              className={`px-4 py-3 rounded-xl border transition ${
                tab === name
                  ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-200/60'
                  : 'bg-white/85 border-white/80 text-slate-700 hover:border-blue-200'
              }`}
            >
              {name === 'overview' ? 'Statistiques' : name === 'users' ? 'Utilisateurs' : name === 'events' ? 'Événements' : name === 'inscriptions' ? 'Inscriptions' : 'Villes'}
            </button>
          ))}
        </div>

        {tab === 'overview' && overview && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-5 gap-4">
              <StatCard label="Utilisateurs" value={overview.users.total} />
              <StatCard label="Admins" value={overview.users.admins} />
              <StatCard label="Organisateurs" value={overview.users.organizers} />
              <StatCard label="Événements" value={overview.events.total} />
              <StatCard label="Inscriptions" value={overview.inscriptions.total} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <StatCard label="Paiements confirmés" value={overview.payments.paidCount} />
              <StatCard label="Revenus" value={`${overview.payments.totalRevenue.toFixed(2)} EUR`} />
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/85 backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(120,170,215,0.12)]">
              <h2 className="text-lg font-semibold mb-3">Top événements récents</h2>
              <div className="space-y-2">
                {overview.highlights.map((event) => (
                  <div key={event.id} className="rounded-lg bg-blue-50/80 border border-blue-100 px-3 py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-slate-500">{new Date(event.date).toLocaleString('fr-FR')}</p>
                    </div>
                    <p className="text-sm text-blue-700">{event.participantsCount}/{event.maxPeople}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-white/90 backdrop-blur-xl p-4 space-y-3 shadow-[0_8px_28px_rgba(120,170,215,0.10)]">
              <h2 className="text-base font-semibold text-slate-800">Créer un utilisateur</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input value={createUserForm.prenom} onChange={(e) => setCreateUserForm((f) => ({ ...f, prenom: e.target.value }))} placeholder="Prénom" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <input value={createUserForm.nom} onChange={(e) => setCreateUserForm((f) => ({ ...f, nom: e.target.value }))} placeholder="Nom" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <input value={createUserForm.username} onChange={(e) => setCreateUserForm((f) => ({ ...f, username: e.target.value }))} placeholder="Nom d'utilisateur" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <input value={createUserForm.email} onChange={(e) => setCreateUserForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" type="email" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <input value={createUserForm.password} onChange={(e) => setCreateUserForm((f) => ({ ...f, password: e.target.value }))} placeholder="Mot de passe" type="password" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <select value={createUserForm.role} onChange={(e) => setCreateUserForm((f) => ({ ...f, role: e.target.value }))} className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm">
                  <option value="participant">Participant</option>
                  <option value="organisateur">Organisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button onClick={handleCreateUser} className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium">Créer l'utilisateur</button>
              {createUserMsg && (
                <p className={`text-sm ${createUserMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{createUserMsg.text}</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                placeholder="Rechercher utilisateur"
                className="w-full rounded-xl bg-white/90 border border-blue-100 px-3 py-2"
              />
              <button onClick={loadUsers} className="px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white">Chercher</button>
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="rounded-xl border border-white/90 bg-white/90 backdrop-blur-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0_8px_28px_rgba(120,170,215,0.10)]">
                  <div>
                    <p className="font-semibold">{user.prenom} {user.nom} (@{user.username})</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.role}
                      onChange={async (e) => {
                        try {
                          await handleRoleChange(user.id, e.target.value as 'admin' | 'organizer' | 'participant');
                        } catch (e: any) {
                          alert(e.message || 'Erreur rôle.');
                        }
                      }}
                      className="bg-white border border-blue-100 rounded-xl px-2 py-2"
                    >
                      <option value="participant">participant</option>
                      <option value="organizer">organisateur</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Supprimer cet utilisateur ?')) return;
                        try {
                          await handleDeleteUser(user.id);
                        } catch (e: any) {
                          alert(e.message || 'Erreur de suppression utilisateur.');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'events' && (
          <section className="space-y-4">
            <div className="flex gap-2">
              <input
                value={eventsSearch}
                onChange={(e) => setEventsSearch(e.target.value)}
                placeholder="Rechercher événement"
                className="w-full rounded-xl bg-white/90 border border-blue-100 px-3 py-2"
              />
              <button onClick={loadEvents} className="px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white">Chercher</button>
            </div>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-white/90 bg-white/90 backdrop-blur-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0_8px_28px_rgba(120,170,215,0.10)]">
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-slate-600">{new Date(event.date).toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-slate-500">{event.location?.city || 'Ville inconnue'} {event.location?.postal_code ? `(${event.location.postal_code})` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-700">{event.participantsCount}/{event.maxPeople}</span>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Supprimer cet événement ?')) return;
                        try {
                          await handleDeleteEvent(event.id);
                        } catch (e: any) {
                          alert(e.message || 'Erreur de suppression événement.');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === 'inscriptions' && (
          <section className="space-y-4">
            <div className="flex gap-2">
              <input
                value={inscriptionsSearch}
                onChange={(e) => setInscriptionsSearch(e.target.value)}
                placeholder="Rechercher par utilisateur"
                className="w-full rounded-xl bg-white/90 border border-blue-100 px-3 py-2"
              />
              <button onClick={loadInscriptions} className="px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white">Chercher</button>
            </div>
            <div className="space-y-2">
              {inscriptions.map((inscription) => (
                <div key={inscription.id} className="rounded-xl border border-white/90 bg-white/90 backdrop-blur-xl p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-[0_8px_28px_rgba(120,170,215,0.10)]">
                  <div>
                    <p className="font-semibold">{inscription.user?.username || 'Utilisateur inconnu'} {'->'} {inscription.event?.title || 'Événement inconnu'}</p>
                    <p className="text-sm text-slate-600">{new Date(inscription.createdAt).toLocaleString('fr-FR')} | statut : {inscription.status}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Supprimer cette inscription ?')) return;
                      try {
                        await handleDeleteInscription(inscription.id);
                      } catch (e: any) {
                        alert(e.message || 'Erreur de suppression inscription.');
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
        {tab === 'localisations' && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-white/90 backdrop-blur-xl p-5 space-y-3 shadow-[0_8px_28px_rgba(120,170,215,0.10)]">
              <h2 className="text-base font-semibold text-slate-800">Créer une ville / localisation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input value={createLocForm.address} onChange={(e) => setCreateLocForm((f) => ({ ...f, address: e.target.value }))} placeholder="Adresse" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <input value={createLocForm.city} onChange={(e) => setCreateLocForm((f) => ({ ...f, city: e.target.value }))} placeholder="Ville" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
                <input value={createLocForm.postal_code} onChange={(e) => setCreateLocForm((f) => ({ ...f, postal_code: e.target.value }))} placeholder="Code postal" className="rounded-xl bg-white border border-blue-100 px-3 py-2 text-sm" />
              </div>
              <button onClick={handleCreateLocalisation} className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium">Créer la ville</button>
              {createLocMsg && (
                <p className={`text-sm ${createLocMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>{createLocMsg.text}</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="rounded-2xl border border-white/90 bg-white/90 backdrop-blur-xl p-4 shadow-[0_8px_28px_rgba(120,170,215,0.10)]">
      <p className="text-sm uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold mt-1 text-slate-900">{value}</p>
    </div>
  );
};

export default AdminPanel;
