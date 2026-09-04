import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bed,
  Calendar,
  MessageSquare,
  CreditCard,
  Download,
  FileText,
  Heart,
  Home,
  IndianRupee,
  Loader2,
  MapPin,
  Maximize,
  Phone,
  TrendingUp,
  User,
  Scale,
  Clock,
  X,
  Upload,
  Plus,
  Mail,
  Edit3,
  Save,
} from 'lucide-react';
import { supabase, type Property, type LoanApplication, type LegalRequest, type UserDocument, type UserProfile, type SupportTicket, type Lead } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useAuthUI } from '../lib/authUI';

type TabType = 'overview' | 'favorites' | 'enquiries' | 'loans' | 'legal' | 'documents' | 'support' | 'profile';

const FALLBACK_IMG = 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800';

function formatCurrency(value: number): string {
  if (value >= 10000000) return `Rs ${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(2)} L`;
  return `Rs ${value.toLocaleString('en-IN')}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function UserDashboardPage() {
  const { user, signOut } = useAuth();
  const { openAuth } = useAuthUI();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [enquiries, setEnquiries] = useState<Lead[]>([]);
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [legalRequests, setLegalRequests] = useState<LegalRequest[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // Support ticket form
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'property' as SupportTicket['category'], priority: 'normal' as SupportTicket['priority'], description: '' });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Edit Profile State
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    bio: '',
  });

  // Upload Document State
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docType, setDocType] = useState<UserDocument['document_type']>('pan_card');
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user) return;
    loadAllData();
  }, [user]);

  async function loadAllData() {
    setLoading(true);
    await Promise.all([
      loadProfile(),
      loadFavorites(),
      loadEnquiries(),
      loadLoanApplications(),
      loadLegalRequests(),
      loadDocuments(),
    ]);
    setLoading(false);
  }

  async function loadProfile() {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    if (data) setProfile(data as UserProfile);
  }

  async function handleSaveProfile() {
    setProfileError(null);
    setSavingProfile(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: editForm.full_name,
        phone: editForm.phone,
        city: editForm.city,
        bio: editForm.bio,
      })
      .eq('user_id', user?.id);
    setSavingProfile(false);
    if (error) {
      setProfileError(error.message);
      return;
    }
    setEditing(false);
    await loadProfile();
  }

  async function loadFavorites() {
    const { data: favData } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', user?.id);
    if (favData && favData.length > 0) {
      const ids = favData.map(f => f.property_id);
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids);
      if (properties) setFavoriteProperties(properties as Property[]);
    }
  }

  async function loadEnquiries() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setEnquiries(data as Lead[]);
  }

  async function loadLoanApplications() {
    const { data } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setLoanApplications(data as LoanApplication[]);
  }

  async function loadLegalRequests() {
    const { data } = await supabase
      .from('legal_requests')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setLegalRequests(data as LegalRequest[]);
  }

  async function loadDocuments() {
    const { data } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user?.id)
      .order('uploaded_at', { ascending: false });
    if (data) setDocuments(data as UserDocument[]);
  }

  async function loadTickets() {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    if (data) setTickets(data as SupportTicket[]);
  }

  async function handleSubmitTicket() {
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;
    setSubmittingTicket(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id,
        subject: ticketForm.subject,
        category: ticketForm.category,
        priority: ticketForm.priority,
        description: ticketForm.description,
        status: 'open',
      });
      if (error) throw error;
      setTicketForm({ subject: '', category: 'property', priority: 'normal', description: '' });
      setShowNewTicket(false);
      loadTickets();
    } catch (err: any) {
      alert('Failed to submit ticket: ' + err.message);
    } finally {
      setSubmittingTicket(false);
    }
  }

  async function handleUploadDocument() {
    if (!docFile) {
      alert('Please select a file to upload');
      return;
    }
    setUploadingDoc(true);
    try {
      const ext = docFile.name.split('.').pop();
      const path = `${user?.id}/${docType}_${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('user-documents')
        .upload(path, docFile, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('user-documents').getPublicUrl(path);
      const { error: dbError } = await supabase.from('user_documents').insert({
        user_id: user?.id,
        document_type: docType,
        document_name: docFile.name,
        document_url: urlData.publicUrl,
      });
      if (dbError) throw dbError;
      setShowUploadDoc(false);
      setDocFile(null);
      loadDocuments();
    loadTickets();
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleDeleteDocument(docId: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    const { error } = await supabase
      .from('user_documents')
      .delete()
      .eq('id', docId);
    if (!error) loadDocuments();
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Home },
    { key: 'favorites', label: 'Favorites', icon: Heart, count: favoriteProperties.length },
    { key: 'enquiries', label: 'Enquiries', icon: Mail, count: enquiries.length },
    { key: 'loans', label: 'Loans', icon: IndianRupee, count: loanApplications.length },
    { key: 'legal', label: 'Legal', icon: Scale, count: legalRequests.length },
    { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { key: 'support', label: 'Support', icon: MessageSquare, count: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  const statusColors: Record<string, string> = {
    draft: 'text-slate-600 bg-slate-50',
    submitted: 'text-blue-600 bg-blue-50',
    documents_pending: 'text-yellow-600 bg-yellow-50',
    under_review: 'text-orange-600 bg-orange-50',
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
    disbursed: 'text-green-700 bg-green-100',
    requested: 'text-blue-600 bg-blue-50',
    quoted: 'text-yellow-600 bg-yellow-50',
    confirmed: 'text-green-600 bg-green-50',
    in_progress: 'text-orange-600 bg-orange-50',
    completed: 'text-green-700 bg-green-100',
    cancelled: 'text-red-600 bg-red-50',
    pending: 'text-yellow-600 bg-yellow-50',
    paid: 'text-green-600 bg-green-50',
    refunded: 'text-red-600 bg-red-50',
    verified: 'text-green-600 bg-green-50',
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-slate-900 mb-2">
            Sign In to View Dashboard
          </h2>
          <p className="text-slate-600 mb-6">
            Access your favorites, applications, and more.
          </p>
          <button
            onClick={() => openAuth('signin')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* User Info */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-900">
                <div className="w-14 h-14 rounded-full bg-gold-500 flex items-center justify-center text-slate-900 font-serif text-2xl font-bold mb-3">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-white font-semibold truncate">
                  {profile?.full_name || user.email?.split('@')[0]}
                </div>
                <div className="text-slate-300 text-sm truncate">{user.email}</div>
                {profile?.role && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-gold-500/20 text-gold-300 text-xs rounded-full capitalize">
                    {profile.role}
                  </span>
                )}
              </div>

              {/* Navigation */}
              <nav className="p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Tab Bar */}
            <div className="lg:hidden mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="text-xs">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="text-slate-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h1 className="font-serif text-2xl font-bold text-slate-900">
                      Welcome back, {profile?.full_name || user.email?.split('@')[0]}!
                    </h1>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-slate-100 p-6">
                        <Heart className="w-8 h-8 text-red-500 mb-3" />
                        <div className="text-2xl font-bold text-slate-900">{favoriteProperties.length}</div>
                        <div className="text-slate-600 text-sm">Favorites</div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-100 p-6">
                        <IndianRupee className="w-8 h-8 text-green-500 mb-3" />
                        <div className="text-2xl font-bold text-slate-900">{loanApplications.length}</div>
                        <div className="text-slate-600 text-sm">Loan Applications</div>
                      </div>
                      <div className="bg-white rounded-xl border border-slate-100 p-6">
                        <Scale className="w-8 h-8 text-blue-500 mb-3" />
                        <div className="text-2xl font-bold text-slate-900">{legalRequests.length}</div>
                        <div className="text-slate-600 text-sm">Legal Requests</div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      <h2 className="font-serif text-lg font-bold text-slate-900 mb-4">
                        Recent Activity
                      </h2>
                      {[...loanApplications, ...legalRequests].length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600">No recent activity</p>
                          <Link to="/projects" className="inline-block mt-4 text-gold-600 font-medium hover:text-gold-700">
                            Browse Properties <ArrowRight size={16} className="inline" />
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {loanApplications.slice(0, 3).map((loan) => (
                            <div key={loan.id} className="py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                  <IndianRupee className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900 text-sm">
                                    Loan Application - {formatCurrency(loan.desired_loan_amount)}
                                  </div>
                                  <div className="text-slate-500 text-xs">{formatDate(loan.created_at)}</div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[loan.status]}`}>
                                {loan.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Link to="/home-loans" className="bg-white rounded-xl border border-slate-100 p-5 hover:border-gold-300 transition-colors group">
                        <CreditCard className="w-6 h-6 text-gold-500 mb-3" />
                        <h3 className="font-semibold text-slate-900 text-sm">Apply for Loan</h3>
                        <p className="text-slate-500 text-xs mt-1">Check eligibility</p>
                      </Link>
                      <Link to="/legal" className="bg-white rounded-xl border border-slate-100 p-5 hover:border-gold-300 transition-colors group">
                        <Scale className="w-6 h-6 text-blue-500 mb-3" />
                        <h3 className="font-semibold text-slate-900 text-sm">Legal Services</h3>
                        <p className="text-slate-500 text-xs mt-1">Documentation help</p>
                      </Link>
                      <Link to="/tools" className="bg-white rounded-xl border border-slate-100 p-5 hover:border-gold-300 transition-colors group">
                        <TrendingUp className="w-6 h-6 text-green-500 mb-3" />
                        <h3 className="font-semibold text-slate-900 text-sm">Tools</h3>
                        <p className="text-slate-500 text-xs mt-1">EMI Calculator</p>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Favorites Tab */}
                {activeTab === 'favorites' && (
                  <div>
                    <h1 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                      Your Favorites
                    </h1>
                    {favoriteProperties.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                        <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                          No Favorites Yet
                        </h3>
                        <p className="text-slate-600 mb-6">
                          Start exploring properties and save your favorites here.
                        </p>
                        <Link
                          to="/projects"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                        >
                          Browse Properties <ArrowRight size={18} />
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {favoriteProperties.map((property) => (
                          <div
                            key={property.id}
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all"
                          >
                            <div className="relative h-40">
                              <img
                                src={property.image_url || FALLBACK_IMG}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-0.5 bg-white/90 text-slate-900 text-xs font-medium rounded capitalize">
                                  {property.type}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-center gap-1 text-slate-500 text-xs mb-1">
                                <MapPin size={12} />
                                {property.location}
                              </div>
                              <h3 className="font-serif font-bold text-slate-900 mb-2 line-clamp-1">
                                {property.title}
                              </h3>
                              <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                                {property.bedrooms !== null && (
                                  <span className="flex items-center gap-1">
                                    <Bed size={12} className="text-gold-500" /> {property.bedrooms} BHK
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Maximize size={12} className="text-gold-500" /> {property.area}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-lg font-bold text-slate-900">
                                  {property.price_value ? formatCurrency(property.price_value) : property.price}
                                </span>
                                <Link
                                  to={`/projects/${property.id}`}
                                  className="px-3 py-1.5 text-xs font-medium text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Enquiries Tab */}
                {activeTab === 'enquiries' && (
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-slate-900 mb-6">My Enquiries</h2>
                    {enquiries.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-2xl">
                        <Mail size={40} className="text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 mb-2">No enquiries yet</p>
                        <p className="text-sm text-slate-400">Enquiries you submit on properties will appear here.</p>
                        <Link to="/projects" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                          Browse Properties
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {enquiries.map(enq => (
                          <div key={enq.id} className="bg-white border border-slate-100 rounded-xl p-5 flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              enq.lead_type === 'site_visit' ? 'bg-blue-50' : enq.lead_type === 'callback' ? 'bg-amber-50' : 'bg-slate-50'
                            }`}>
                              {enq.lead_type === 'site_visit' ? <Calendar size={18} className="text-blue-600" /> : enq.lead_type === 'callback' ? <Phone size={18} className="text-amber-600" /> : <MessageSquare size={18} className="text-slate-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-slate-900 capitalize">{enq.lead_type.replace(/_/g, ' ')}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  enq.status === 'new' ? 'bg-blue-50 text-blue-600' :
                                  enq.status === 'contacted' ? 'bg-amber-50 text-amber-600' :
                                  enq.status === 'closed' ? 'bg-green-50 text-green-600' :
                                  'bg-slate-100 text-slate-500'
                                }`}>{enq.status}</span>
                              </div>
                              {enq.message && <p className="text-sm text-slate-600 mb-1">{enq.message}</p>}
                              {enq.preferred_date && (
                                <p className="text-xs text-slate-400">Preferred: {enq.preferred_date}{enq.preferred_time ? ` at ${enq.preferred_time}` : ''}</p>
                              )}
                              <p className="text-xs text-slate-400 mt-1">{new Date(enq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Loans Tab */}
                {activeTab === 'loans' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="font-serif text-2xl font-bold text-slate-900">
                        Loan Applications
                      </h1>
                      <Link
                        to="/home-loans"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm"
                      >
                        Apply New <ArrowRight size={16} />
                      </Link>
                    </div>
                    {loanApplications.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                        <IndianRupee className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                          No Loan Applications
                        </h3>
                        <p className="text-slate-600 mb-6">
                          Apply for a home loan and track your application here.
                        </p>
                        <Link
                          to="/home-loans"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg"
                        >
                          Apply for Loan <ArrowRight size={18} />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {loanApplications.map((loan) => (
                          <div key={loan.id} className="bg-white rounded-xl border border-slate-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-slate-900 capitalize">
                                    {loan.application_type.replace('_', ' ')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColors[loan.status]}`}>
                                    {loan.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-slate-600 text-sm">
                                  Applied on {formatDate(loan.created_at)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-serif text-xl font-bold text-slate-900">
                                  {formatCurrency(loan.desired_loan_amount)}
                                </div>
                                <div className="text-slate-500 text-xs">
                                  {loan.tenure_years} years @ {loan.employment_type}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-sm">
                              <div>
                                <div className="text-slate-500 text-xs">Income</div>
                                <div className="font-medium text-slate-900">{formatCurrency(loan.monthly_income)}/mo</div>
                              </div>
                              <div>
                                <div className="text-slate-500 text-xs">Existing EMI</div>
                                <div className="font-medium text-slate-900">{formatCurrency(loan.existing_emis)}/mo</div>
                              </div>
                              <div>
                                <div className="text-slate-500 text-xs">Property Value</div>
                                <div className="font-medium text-slate-900">
                                  {loan.property_value ? formatCurrency(loan.property_value) : 'N/A'}
                                </div>
                              </div>
                              <div>
                                <div className="text-slate-500 text-xs">Assigned To</div>
                                <div className="font-medium text-slate-900">
                                  {loan.assigned_to || 'Pending'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Legal Tab */}
                {activeTab === 'legal' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="font-serif text-2xl font-bold text-slate-900">
                        Legal Requests
                      </h1>
                      <Link
                        to="/legal"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm"
                      >
                        Request New <ArrowRight size={16} />
                      </Link>
                    </div>
                    {legalRequests.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                        <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                          No Legal Requests
                        </h3>
                        <p className="text-slate-600 mb-6">
                          Get property documents drafted by legal experts.
                        </p>
                        <Link
                          to="/legal"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg"
                        >
                          View Services <ArrowRight size={18} />
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {legalRequests.map((request) => (
                          <div key={request.id} className="bg-white rounded-xl border border-slate-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColors[request.status]}`}>
                                    {request.status.replace('_', ' ')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColors[request.payment_status]}`}>
                                    {request.payment_status}
                                  </span>
                                </div>
                                <div className="text-slate-600 text-sm">
                                  Requested on {formatDate(request.created_at)}
                                </div>
                              </div>
                            </div>
                            {request.property_address && (
                              <div className="text-sm text-slate-700 mb-2">
                                Property: {request.property_address}
                              </div>
                            )}
                            {request.assigned_advocate && (
                              <div className="text-sm text-slate-700">
                                Advocate: {request.assigned_advocate}
                              </div>
                            )}
                            {request.document_url && (
                              <a
                                href={request.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 text-sm text-gold-600 font-medium hover:underline"
                              >
                                <Download size={16} />
                                Download Document
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === 'documents' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="font-serif text-2xl font-bold text-slate-900">
                        Your Documents
                      </h1>
                      <button
                        onClick={() => setShowUploadDoc(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm"
                      >
                        <Upload size={16} />
                        Upload Document
                      </button>
                    </div>
                    {documents.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">
                          No Documents Uploaded
                        </h3>
                        <p className="text-slate-600 mb-6">
                          Upload your ID proofs and property documents for faster processing.
                        </p>
                        <button
                          onClick={() => setShowUploadDoc(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-600 text-slate-900 font-semibold rounded-lg"
                        >
                          <Upload size={18} />
                          Upload Document
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                          <div key={doc.id} className="bg-white rounded-xl border border-slate-100 p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">
                                    {doc.document_name}
                                  </div>
                                  <div className="text-slate-500 text-xs">
                                    Uploaded {formatDate(doc.uploaded_at)}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[doc.verified ? 'verified' : 'pending']}`}>
                                {doc.verified ? 'Verified' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center py-2 text-sm font-medium text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                              >
                                View
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="px-3 py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Support Tickets Tab */}
                {activeTab === 'support' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="font-serif text-2xl font-bold text-slate-900">Support Tickets</h1>
                      <button
                        onClick={() => setShowNewTicket(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm"
                      >
                        <Plus size={16} /> New Ticket
                      </button>
                    </div>
                    {tickets.length === 0 ? (
                      <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
                        <MessageSquare className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-serif text-lg font-bold text-slate-800 mb-2">No support tickets</h3>
                        <p className="text-slate-500 text-sm mb-4">Need help? Raise a ticket and our team will respond within 24 hours.</p>
                        <button onClick={() => setShowNewTicket(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800">
                          <Plus size={16} /> Raise a Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tickets.map((ticket) => (
                          <div key={ticket.id} className="bg-white rounded-xl border border-slate-100 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-semibold text-slate-900 text-sm">{ticket.subject}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    ticket.status === 'open' ? 'bg-amber-100 text-amber-700' :
                                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>{ticket.status.replace('_', ' ')}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    'bg-slate-100 text-slate-600'
                                  }`}>{ticket.priority}</span>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                                {ticket.resolution && (
                                  <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-800">
                                    <span className="font-semibold">Resolution: </span>{ticket.resolution}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 whitespace-nowrap">{formatDate(ticket.created_at)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="font-serif text-2xl font-bold text-slate-900">
                        Profile Settings
                      </h1>
                      {!editing && (
                        <button
                          onClick={() => {
                            setEditForm({
                              full_name: profile?.full_name || '',
                              phone: profile?.phone || '',
                              city: profile?.city || '',
                              bio: profile?.bio || '',
                            });
                            setProfileError(null);
                            setEditing(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white font-semibold rounded-2xl hover:bg-gold-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                    <div className="bg-white rounded-xl border border-slate-100 p-6">
                      {profileError && (
                        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
                          {profileError}
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            value={editing ? editForm.full_name : profile?.full_name || ''}
                            readOnly={!editing}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-gold-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={user.email || ''}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            value={editing ? editForm.phone : profile?.phone || ''}
                            readOnly={!editing}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-gold-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                          <input
                            type="text"
                            value={profile?.role || 'buyer'}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 capitalize"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                          <input
                            type="text"
                            value={editing ? editForm.city : profile?.city || ''}
                            readOnly={!editing}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-gold-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">KYC Status</label>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
                              profile?.kyc_status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : profile?.kyc_status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {profile?.kyc_status || 'pending'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {editing && (
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                          <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-gold-500 focus:outline-none resize-none"
                          />
                        </div>
                      )}

                      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                        {editing ? (
                          <>
                            <button
                              onClick={handleSaveProfile}
                              disabled={savingProfile}
                              className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-white font-semibold rounded-2xl hover:bg-gold-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Save className="w-4 h-4" />
                              {savingProfile ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button
                              onClick={() => {
                                setEditing(false);
                                setProfileError(null);
                              }}
                              className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={signOut}
                            className="px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100"
                          >
                            Sign Out
                          </button>
                        )}
                        {!editing && (
                          <button
                            onClick={() => openAuth('forgot')}
                            className="text-gold-600 hover:text-gold-700 font-semibold text-sm"
                          >
                            Change Password
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70" onClick={() => setShowUploadDoc(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="font-serif text-xl font-bold text-slate-900 mb-6">
              Upload Document
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as UserDocument['document_type'])}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20"
                >
                  <option value="pan_card">PAN Card</option>
                  <option value="aadhaar_card">Aadhaar Card</option>
                  <option value="passport">Passport</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="driving_license">Driving License</option>
                  <option value="salary_slip">Salary Slip</option>
                  <option value="bank_statement">Bank Statement</option>
                  <option value="itr">ITR</option>
                  <option value="form_16">Form 16</option>
                  <option value="property_deed">Property Deed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-gold-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="doc-file-input"
                  />
                  <label htmlFor="doc-file-input" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    {docFile ? (
                      <p className="text-sm font-medium text-slate-900">{docFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-700">Click to choose a file</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG or WebP — max 10 MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              <button
                onClick={handleUploadDocument}
                disabled={uploadingDoc || !docFile}
                className="w-full px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-60"
              >
                {uploadingDoc ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Support Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-serif text-xl font-bold text-slate-900">Raise a Support Ticket</h3>
              <button onClick={() => setShowNewTicket(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm(f => ({ ...f, category: e.target.value as SupportTicket['category'] }))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none"
                  >
                    <option value="property">Property</option>
                    <option value="loan">Home Loan</option>
                    <option value="legal">Legal</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm(f => ({ ...f, priority: e.target.value as SupportTicket['priority'] }))}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmitTicket}
                  disabled={submittingTicket || !ticketForm.subject.trim() || !ticketForm.description.trim()}
                  className="flex-1 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                </button>
                <button onClick={() => setShowNewTicket(false)} className="px-6 py-3.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
