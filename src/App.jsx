import React, { useState, useEffect } from 'react';
import {
MapPin, Plus, X, Search, Navigation, Pizza, Beef, Truck, Flame, Star,
Loader2, Trash2, ChevronRight, UtensilsCrossed, LogOut, Mail, Lock, Send,
} from 'lucide-react';
import { supabase } from './supabaseClient';

// To hand admin off to your friend later: update this array AND the
// "Admin delete" policies in Supabase (see SQL_SETUP_v2.sql), then redeploy.
const ADMIN_EMAILS = ['bjohnson0987@gmail.com'];

const ZIP_STORAGE_KEY = '773cuisine-zip-location';

const rowToVendor = (r) => ({
id: r.id, name: r.name, category: r.category, description: r.description,
lat: r.lat, lng: r.lng, addedBy: r.added_by, addedAt: r.added_at,
menuItems: r.menu_items || [],
});
const vendorToRow = (v) => ({
id: v.id, name: v.name, category: v.category, description: v.description,
lat: v.lat, lng: v.lng, added_by: v.addedBy, added_at: v.addedAt,
menu_items: v.menuItems || [],
});

const rowToReview = (r) => ({
id: r.id, vendorId: r.vendor_id, userId: r.user_id, userEmail: r.user_email,
rating: r.rating, comment: r.comment, createdAt: r.created_at,
});

const COLORS = {
bg: '#F5F8FB',
flagBlue: '#2E5C8A',
flagBlueLight: '#5C93C4',
flagRed: '#C8102E',
mustard: '#E2A712',
ink: '#161B22',
slate: '#5B6472',
slateLight: '#8993A4',
cardBg: '#FFFFFF',
border: '#E2E7EE',
taco: '#2F8F5B',
};

const CATEGORIES = [
{ id: 'deep-dish', label: 'Deep Dish', color: COLORS.flagBlue, Icon: Pizza },
{ id: 'tavern', label: 'Tavern-Style', color: COLORS.flagBlueLight, Icon: Pizza },
{ id: 'hot-dog', label: 'Hot Dog', color: COLORS.mustard, Icon: Flame },
{ id: 'italian-beef', label: 'Italian Beef', color: COLORS.flagRed, Icon: Beef },
{ id: 'tacos', label: 'Mexican Street Tacos', color: COLORS.taco, Icon: UtensilsCrossed },
{ id: 'food-truck', label: 'Food Truck', color: COLORS.slate, Icon: Truck },
{ id: 'other', label: 'Other', color: '#8A6D3B', Icon: Star },
];

const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const SEED_VENDORS = [
{ id: 'seed-1', name: "Lou Malnati's Pizzeria", category: 'deep-dish', description: "The OG stuffed deep dish since 1971 — butter crust, chunky tomato sauce on top.", lat: 41.8907, lng: -87.6343, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Small Cheese Deep Dish', price: 19.5 }, { name: 'The Malnati Chicago Classic', price: 24.95 }, { name: 'Chopped Salad', price: 8.5 }] },
{ id: 'seed-2', name: "Pequod's Pizza", category: 'deep-dish', description: "Caramelized cheese crust that fights back. Worth the wait.", lat: 41.9226, lng: -87.6644, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: "Pequod's Pan Pizza (medium)", price: 22.0 }, { name: 'Garlic Bread', price: 6.0 }] },
{ id: 'seed-3', name: "Portillo's (Clark St)", category: 'italian-beef', description: "Chicago dogs and dipped Italian beef, slinging since 1963.", lat: 41.8917, lng: -87.6296, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }, { name: 'Chicago-Style Hot Dog', price: 4.29 }, { name: 'Chocolate Cake Shake', price: 6.29 }] },
{ id: 'seed-4', name: "Al's Beef (Original)", category: 'italian-beef', description: "The Taylor St original. Get it dipped, hot peppers non-negotiable.", lat: 41.8695, lng: -87.6558, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef Sandwich', price: 8.99 }, { name: 'Combo (Beef & Sausage)', price: 10.99 }] },
{ id: 'seed-5', name: 'Superdawg Drive-In', category: 'hot-dog', description: "Car-hop drive-in slinging Chicago dogs since 1948. No ketchup, ever.", lat: 41.9967, lng: -87.7864, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Superdawg', price: 5.75 }, { name: 'Whoopercheesie', price: 6.5 }, { name: 'Crispy Fries', price: 4.25 }] },
{ id: 'seed-6', name: "Gene & Jude's", category: 'hot-dog', description: "Fries in the dog, no tomato, sport peppers only. Purists' pick.", lat: 41.9308, lng: -87.8378, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Hot Dog', price: 3.5 }, { name: 'French Fries', price: 3.5 }] },
{ id: 'seed-7', name: "Pizano's Pizza & Pasta", category: 'tavern', description: "Thin, cracker-crust tavern-style pizza, cut in squares.", lat: 41.8819, lng: -87.6256, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Thin Crust Cheese (large)', price: 18.5 }, { name: 'Meatball Sandwich', price: 11.0 }] },
{ id: 'seed-8', name: "The Wiener's Circle", category: 'hot-dog', description: "Late-night dog stand famous for the free insults with your order.", lat: 41.9298, lng: -87.6438, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Char Dog', price: 4.5 }, { name: 'Cheddar Fries', price: 5.5 }] },
{ id: 'seed-9', name: "Portillo's (Chandler)", category: 'italian-beef', description: "Chicago dogs and dipped beef in the Valley of the Sun.", lat: 33.3062, lng: -111.8413, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }, { name: 'Chicago-Style Hot Dog', price: 4.29 }] },
{ id: 'seed-10', name: "Portillo's (Frisco)", category: 'italian-beef', description: "DFW's take on the Chicago classics — beef, dogs, chocolate cake.", lat: 33.1507, lng: -96.8236, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }, { name: 'Chocolate Cake', price: 4.5 }] },
{ id: 'seed-11', name: "Portillo's (Katy)", category: 'italian-beef', description: "Houston-area Portillo's bringing the Chicago street food menu south.", lat: 29.7858, lng: -95.8244, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }, { name: 'Chicago-Style Hot Dog', price: 4.29 }] },
{ id: 'seed-12', name: "Portillo's (Brandon)", category: 'italian-beef', description: "Florida's first Portillo's, open since 2016.", lat: 27.9378, lng: -82.2859, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-13', name: "Portillo's (Orlando)", category: 'italian-beef', description: "Chicago dogs and dipped beef near the theme parks.", lat: 28.5383, lng: -81.3792, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Chicago-Style Hot Dog', price: 4.29 }] },
{ id: 'seed-14', name: "Portillo's (Avon)", category: 'italian-beef', description: "Indianapolis-area Portillo's serving the classics.", lat: 39.7625, lng: -86.4008, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-15', name: "Portillo's (Twin Cities)", category: 'italian-beef', description: "Minneapolis-area outpost of the Chicago hot dog empire.", lat: 44.9483, lng: -93.3477, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-16', name: "Portillo's (Wauwatosa)", category: 'italian-beef', description: "Milwaukee-area Portillo's, close enough to still count as home turf.", lat: 43.0505, lng: -88.0076, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-17', name: "Portillo's (Livonia)", category: 'italian-beef', description: "Detroit-suburb Portillo's for the transplants.", lat: 42.3684, lng: -83.3527, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-18', name: "Portillo's (Davenport)", category: 'italian-beef', description: "Serving the Quad Cities on both sides of the Mississippi.", lat: 41.5236, lng: -90.5776, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-19', name: "Portillo's (Kennesaw)", category: 'italian-beef', description: "Atlanta's first Portillo's, opened 2025.", lat: 34.0234, lng: -84.6155, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-20', name: "Portillo's (Buena Park)", category: 'italian-beef', description: "Portillo's first California location, open since 2006.", lat: 33.8675, lng: -117.9981, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Italian Beef (dipped)', price: 9.49 }] },
{ id: 'seed-21', name: "Lou Malnati's (Scottsdale)", category: 'deep-dish', description: "Deep dish in the desert — same crust, same butter.", lat: 33.4942, lng: -111.9261, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Small Cheese Deep Dish', price: 19.5 }] },
{ id: 'seed-22', name: "Lou Malnati's (Arcadia, Phoenix)", category: 'deep-dish', description: "Phoenix-area stuffed deep dish, shipped-in-spirit from Buffalo Grove.", lat: 33.5006, lng: -112.0079, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Small Cheese Deep Dish', price: 19.5 }] },
{ id: 'seed-23', name: "Lou Malnati's (Carmel)", category: 'deep-dish', description: "Indianapolis-area deep dish from the Malnati family.", lat: 39.9784, lng: -86.1180, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Small Cheese Deep Dish', price: 19.5 }] },
{ id: 'seed-24', name: "Lou Malnati's (Wauwatosa)", category: 'deep-dish', description: "Milwaukee-area deep dish outpost.", lat: 43.0505, lng: -88.0076, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Small Cheese Deep Dish', price: 19.5 }] },
{ id: 'seed-25', name: 'Carnitas Uruapan', category: 'tacos', description: "Pilsen institution since 1975, dedicated almost entirely to slow-cooked pork carnitas — a Midwest go-to for authentic street-style tacos.", lat: 41.8536, lng: -87.6612, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Carnitas Tacos (order)', price: 9.5 }, { name: 'Carnitas by the Pound', price: 16.0 }] },
{ id: 'seed-26', name: 'Birrieria Zaragoza', category: 'tacos', description: "Family-run Uptown spot specializing in Jalisco-style birria — goat tacos with a side of rich consomme for dipping.", lat: 41.9649, lng: -87.6572, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Birria Taco', price: 4.0 }, { name: 'Quesabirria Taco', price: 4.75 }] },
{ id: 'seed-27', name: 'Taqueria El Milagro', category: 'tacos', description: "Little Village taqueria known for made-from-scratch tortillas and build-your-own street tacos.", lat: 41.8482, lng: -87.7059, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Street Taco (each)', price: 2.75 }, { name: 'Taco Plate (3)', price: 9.5 }] },
{ id: 'seed-28', name: 'La Lagartija Taqueria', category: 'tacos', description: "Fulton Market build-your-own taco counter, popular before United Center games.", lat: 41.8860, lng: -87.6568, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Build-Your-Own Taco', price: 3.75 }, { name: 'Chips & Guac', price: 5.5 }] },
{ id: 'seed-29', name: 'Taco Loco of Pilsen', category: 'tacos', description: "No-frills Pilsen taqueria with generous portions and old-school street-cart flavor.", lat: 41.8438, lng: -87.6961, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z', menuItems: [{ name: 'Al Pastor Tacos (3)', price: 9.0 }, { name: 'Horchata', price: 2.75 }] },
];

function toRad(deg) { return (deg * Math.PI) / 180; }
function milesBetween(lat1, lon1, lat2, lon2) {
const R = 3958.8;
const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);
const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function formatDistance(mi) {
if (mi < 0.1) return `${Math.round(mi * 5280)} ft`;
return `${mi.toFixed(1)} mi`;
}
function formatPrice(p) {
const n = Number(p);
if (Number.isNaN(n)) return '';
return `$${n.toFixed(2)}`;
}
function formatReviewDate(iso) {
try {
return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
} catch (e) {
return '';
}
}

export default function Cuisine773() {
const [vendors, setVendors] = useState([]);
const [loadingVendors, setLoadingVendors] = useState(true);

const [zipCode, setZipCode] = useState(null);
const [zipLat, setZipLat] = useState(null);
const [zipLng, setZipLng] = useState(null);
const [zipLabel, setZipLabel] = useState('');
const [zipCheckDone, setZipCheckDone] = useState(false);
const [showZipGate, setShowZipGate] = useState(false);
const [zipInput, setZipInput] = useState('');
const [zipStatus, setZipStatus] = useState('idle');
const [zipError, setZipError] = useState('');

const [session, setSession] = useState(null);
const [authChecked, setAuthChecked] = useState(false);
const [showAuth, setShowAuth] = useState(false);
const [authMode, setAuthMode] = useState('signin');
const [authEmail, setAuthEmail] = useState('');
const [authPassword, setAuthPassword] = useState('');
const [authError, setAuthError] = useState('');
const [authMessage, setAuthMessage] = useState('');
const [authLoading, setAuthLoading] = useState(false);

const isAdmin = !!(session && session.user && session.user.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

const [search, setSearch] = useState('');
const [activeCategory, setActiveCategory] = useState('all');
const [showAdd, setShowAdd] = useState(false);
const [saveError, setSaveError] = useState('');

const [formName, setFormName] = useState('');
const [formCategory, setFormCategory] = useState(CATEGORIES[0].id);
const [formDesc, setFormDesc] = useState('');
const [formSubmitter, setFormSubmitter] = useState('');
const [formLoc, setFormLoc] = useState(null);
const [formLocStatus, setFormLocStatus] = useState('idle');
const [submitting, setSubmitting] = useState(false);

const [selectedVendor, setSelectedVendor] = useState(null);
const [reviews, setReviews] = useState([]);
const [loadingReviews, setLoadingReviews] = useState(false);
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState('');
const [submittingReview, setSubmittingReview] = useState(false);
const [reviewError, setReviewError] = useState('');

useEffect(() => {
let cancelled = false;
(async () => {
try {
const { data, error } = await supabase.from('vendors').select('*');
if (error) throw error;
if (!cancelled) {
if (data && data.length > 0) {
setVendors(data.map(rowToVendor));
} else {
const { error: seedError } = await supabase.from('vendors').insert(SEED_VENDORS.map(vendorToRow));
if (!seedError) setVendors(SEED_VENDORS);
else setVendors(SEED_VENDORS);
}
}
} catch (e) {
if (!cancelled) setVendors(SEED_VENDORS);
} finally {
if (!cancelled) setLoadingVendors(false);
}
})();
return () => { cancelled = true; };
}, []);

useEffect(() => {
try {
const raw = localStorage.getItem(ZIP_STORAGE_KEY);
if (raw) {
const loc = JSON.parse(raw);
setZipCode(loc.zip || '');
setZipLat(loc.lat ?? null);
setZipLng(loc.lng ?? null);
setZipLabel(loc.label || '');
} else {
setShowZipGate(true);
}
} catch (e) {
setShowZipGate(true);
} finally {
setZipCheckDone(true);
}
}, []);

useEffect(() => {
let cancelled = false;
supabase.auth.getSession().then(({ data }) => {
if (!cancelled) {
setSession(data.session);
setAuthChecked(true);
}
});
const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
setSession(newSession);
});
return () => {
cancelled = true;
listener.subscription.unsubscribe();
};
}, []);

const submitZip = async () => {
const zip = zipInput.trim();
if (!/^\d{5}$/.test(zip)) return;
setZipStatus('loading');
setZipError('');
try {
const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
if (!res.ok) throw new Error('not found');
const data = await res.json();
const place = data.places && data.places[0];
if (!place) throw new Error('no place');
const loc = {
zip,
lat: parseFloat(place.latitude),
lng: parseFloat(place.longitude),
label: `${place['place name']}, ${place['state abbreviation']}`,
};
try { localStorage.setItem(ZIP_STORAGE_KEY, JSON.stringify(loc)); } catch (e) {}
setZipCode(loc.zip);
setZipLat(loc.lat);
setZipLng(loc.lng);
setZipLabel(loc.label);
setZipStatus('idle');
setShowZipGate(false);
} catch (e) {
setZipStatus('error');
setZipError("Couldn't find that ZIP — double check it and try again.");
}
};

const skipZipGate = () => {
const loc = { zip: '', lat: null, lng: null, label: '' };
try { localStorage.setItem(ZIP_STORAGE_KEY, JSON.stringify(loc)); } catch (e) {}
setZipCode(''); setZipLat(null); setZipLng(null); setZipLabel('');
setZipStatus('idle');
setShowZipGate(false);
};

const openZipGate = () => {
setZipInput(zipCode || '');
setZipError('');
setZipStatus('idle');
setShowZipGate(true);
};

const openAuth = (mode) => {
setAuthMode(mode);
setAuthEmail('');
setAuthPassword('');
setAuthError('');
setAuthMessage('');
setShowAuth(true);
};

const closeAuth = () => {
setShowAuth(false);
setAuthError('');
setAuthMessage('');
};

const submitAuth = async () => {
const email = authEmail.trim();
const password = authPassword;
if (!email || !password) {
setAuthError('Enter an email and password.');
return;
}
if (password.length < 6) {
setAuthError('Password needs to be at least 6 characters.');
return;
}
setAuthLoading(true);
setAuthError('');
setAuthMessage('');
try {
if (authMode === 'signup') {
const { data, error } = await supabase.auth.signUp({
email,
password,
options: { emailRedirectTo: window.location.origin },
});
if (error) throw error;
if (data.session) {
setShowAuth(false);
} else {
setAuthMessage('Check your email to confirm your account, then sign in.');
setAuthMode('signin');
}
} else {
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error) throw error;
setShowAuth(false);
}
} catch (e) {
setAuthError(e && e.message ? e.message : 'Something went wrong — try again.');
} finally {
setAuthLoading(false);
}
};

const signOut = async () => {
if (!window.confirm('Log out of 773cuisine?')) return;
await supabase.auth.signOut();
};

const deleteVendor = async (id) => {
if (!isAdmin) return;
if (!window.confirm('Remove this spot from 773cuisine?')) return;
try {
const { error } = await supabase.from('vendors').delete().eq('id', id);
if (error) throw error;
setVendors((prev) => prev.filter((v) => v.id !== id));
if (selectedVendor && selectedVendor.id === id) setSelectedVendor(null);
} catch (e) {
window.alert("Couldn't delete — try again.");
}
};

const captureFormLocation = () => {
if (!navigator.geolocation) { setFormLocStatus('error'); return; }
setFormLocStatus('fetching');
navigator.geolocation.getCurrentPosition(
(pos) => { setFormLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setFormLocStatus('done'); },
() => setFormLocStatus('error'),
{ enableHighAccuracy: true, timeout: 10000 }
);
};

const resetForm = () => {
setFormName(''); setFormCategory(CATEGORIES[0].id); setFormDesc('');
setFormSubmitter(''); setFormLoc(null); setFormLocStatus('idle'); setSaveError('');
};

const submitVendor = async () => {
if (!formName.trim() || !formLoc) return;
setSubmitting(true);
setSaveError('');
const newVendor = {
id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
name: formName.trim(),
category: formCategory,
description: formDesc.trim(),
lat: formLoc.lat,
lng: formLoc.lng,
addedBy: formSubmitter.trim() || 'Anonymous',
addedAt: new Date().toISOString(),
menuItems: [],
};
try {
const { error } = await supabase.from('vendors').insert([vendorToRow(newVendor)]);
if (error) throw error;
setVendors((prev) => [...prev, newVendor]);
setShowAdd(false);
resetForm();
} catch (e) {
setSaveError("Couldn't save that spot — check your connection and try again.");
} finally {
setSubmitting(false);
}
};

const openVendor = async (v) => {
setSelectedVendor(v);
setReviews([]);
setReviewRating(5);
setReviewComment('');
setReviewError('');
setLoadingReviews(true);
try {
const { data, error } = await supabase
.from('reviews')
.select('*')
.eq('vendor_id', v.id)
.order('created_at', { ascending: false });
if (error) throw error;
setReviews((data || []).map(rowToReview));
} catch (e) {
setReviews([]);
} finally {
setLoadingReviews(false);
}
};

const closeVendor = () => {
setSelectedVendor(null);
setReviews([]);
setReviewError('');
};

const submitReview = async () => {
if (!session) { setReviewError('Sign in to leave a review.'); return; }
if (!selectedVendor) return;
if (!reviewComment.trim()) { setReviewError('Add a quick note with your rating.'); return; }
setSubmittingReview(true);
setReviewError('');
try {
const row = {
vendor_id: selectedVendor.id,
user_id: session.user.id,
user_email: session.user.email,
rating: reviewRating,
comment: reviewComment.trim(),
};
const { data, error } = await supabase.from('reviews').insert([row]).select();
if (error) throw error;
const inserted = data && data[0] ? rowToReview(data[0]) : null;
if (inserted) setReviews((prev) => [inserted, ...prev]);
setReviewComment('');
setReviewRating(5);
} catch (e) {
setReviewError("Couldn't post that review — try again.");
} finally {
setSubmittingReview(false);
}
};

const deleteReview = async (reviewId) => {
if (!window.confirm('Delete this review?')) return;
try {
const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
if (error) throw error;
setReviews((prev) => prev.filter((r) => r.id !== reviewId));
} catch (e) {
window.alert("Couldn't delete — try again.");
}
};

const regionCenter = (zipLat != null && zipLng != null) ? { lat: zipLat, lng: zipLng, label: zipLabel } : null;

const withDistance = vendors.map((v) => ({
...v,
distance: regionCenter ? milesBetween(regionCenter.lat, regionCenter.lng, v.lat, v.lng) : null,
}));

const filtered = withDistance
.filter((v) => activeCategory === 'all' || v.category === activeCategory)
.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
.sort((a, b) => {
if (a.distance != null && b.distance != null) return a.distance - b.distance;
return a.name.localeCompare(b.name);
});

const zipValid = /^\d{5}$/.test(zipInput);
const authValid = authEmail.trim().length > 2 && authPassword.length >= 6;

return (
<div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
.sp-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.02em; }
.sp-mono { font-family: 'JetBrains Mono', monospace; }
::selection { background: ${COLORS.flagRed}; color: white; }
`}</style>

<div>
<div style={{ height: 10, background: COLORS.flagBlue }} />
<div style={{ height: 22, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
{[0, 1, 2, 3].map((i) => (
<Star key={i} size={11} fill={COLORS.flagRed} color={COLORS.flagRed} />
))}
</div>
<div style={{ height: 10, background: COLORS.flagBlue }} />
</div>

<div className="max-w-md mx-auto px-4 pb-28">
<div className="pt-6 pb-4">
<h1 className="sp-display text-3xl font-bold" style={{ color: COLORS.ink }}>773cuisine</h1>
<p className="text-sm mt-1" style={{ color: COLORS.slate }}>Chicago-style eats, found near you.</p>
<p className="text-xs mt-2" style={{ color: COLORS.slateLight }}>
773 is Chicago's code. Enter your ZIP and we'll show you the Chicago food near you.
</p>
</div>

{zipCheckDone && !showZipGate && (
<button
onClick={openZipGate}
className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full w-full mb-3"
style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, color: COLORS.ink }}
>
<MapPin size={12} color={COLORS.flagBlue} style={{ flexShrink: 0 }} />
<span className="truncate">
{zipCode ? `${zipCode} · ${zipLabel}` : 'Showing everything'}
</span>
<span style={{ color: COLORS.slateLight, flexShrink: 0 }}>· Change</span>
</button>
)}

<div className="relative mb-3">
<Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: COLORS.slateLight }} />
<input
value={search}
onChange={(e) => setSearch(e.target.value)}
placeholder="Search by name…"
className="w-full text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none"
style={{ border: `1px solid ${COLORS.border}`, background: COLORS.cardBg }}
/>
</div>

<div className="flex gap-2 overflow-x-auto pb-3 mb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
<button
onClick={() => setActiveCategory('all')}
className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
style={activeCategory === 'all' ? { background: COLORS.ink, color: 'white' } : { background: COLORS.cardBg, color: COLORS.slate, border: `1px solid ${COLORS.border}` }}
>
All spots
</button>
{CATEGORIES.map((c) => (
<button
key={c.id}
onClick={() => setActiveCategory(c.id)}
className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
style={activeCategory === c.id ? { background: c.color, color: 'white' } : { background: COLORS.cardBg, color: COLORS.slate, border: `1px solid ${COLORS.border}` }}
>
{c.label}
</button>
))}
</div>

<div className="mt-3 flex flex-col gap-3">
{loadingVendors && (
<div className="text-sm py-10 text-center" style={{ color: COLORS.slateLight }}>Loading spots…</div>
)}
{!loadingVendors && filtered.length === 0 && (
<div className="text-center py-10 px-4 rounded-xl" style={{ background: COLORS.cardBg, border: `1px dashed ${COLORS.border}` }}>
<p className="text-sm font-medium">No spots match yet.</p>
<p className="text-xs mt-1" style={{ color: COLORS.slateLight }}>Be the first to add one nearby.</p>
</div>
)}
{filtered.map((v) => {
const cat = categoryById(v.category);
const Icon = cat.Icon;
return (
<div
key={v.id}
onClick={() => openVendor(v)}
role="button"
tabIndex={0}
className="rounded-xl p-4 text-left"
style={{ background: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}
>
<div className="flex items-start justify-between gap-2">
<div className="flex items-start gap-3 min-w-0">
<div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 36, height: 36, background: cat.color }}>
<Icon size={17} color="white" />
</div>
<div className="min-w-0">
<h3 className="text-sm font-semibold leading-snug">{v.name}</h3>
<div className="flex items-center gap-2 mt-0.5">
<span className="text-[11px] font-medium" style={{ color: cat.color }}>{cat.label}</span>
{v.distance != null && (
<span className="sp-mono text-[11px]" style={{ color: COLORS.slateLight }}>· {formatDistance(v.distance)}</span>
)}
</div>
</div>
</div>
<div className="flex items-center gap-1 flex-shrink-0">
{isAdmin && (
<button
onClick={(e) => { e.stopPropagation(); deleteVendor(v.id); }}
className="p-1.5 rounded-md"
style={{ background: '#FDF1F1' }}
aria-label="Delete spot"
>
<Trash2 size={14} color={COLORS.flagRed} />
</button>
)}
<ChevronRight size={16} color={COLORS.slateLight} />
</div>
</div>
{v.description && (
<p className="text-xs mt-2 leading-relaxed" style={{ color: COLORS.slate }}>{v.description}</p>
)}
<div className="flex items-center justify-between mt-3">
<span className="text-[10px]" style={{ color: COLORS.slateLight }}>Added by {v.addedBy}</span>
<a
href={`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`}
target="_blank" rel="noopener noreferrer"
onClick={(e) => e.stopPropagation()}
className="flex items-center gap-1 text-xs font-medium"
style={{ color: COLORS.flagBlue }}
>
<Navigation size={12} /> Directions
</a>
</div>
</div>
);
})}
</div>

<div className="text-center mt-8 pt-4" style={{ borderTop: `1px solid ${COLORS.border}` }}>
{authChecked && session ? (
<button onClick={signOut} className="text-[11px] inline-flex items-center gap-1" style={{ color: isAdmin ? COLORS.flagRed : COLORS.slateLight, fontWeight: isAdmin ? 600 : 400 }}>
<LogOut size={11} />
{isAdmin ? `Admin · ${session.user.email}` : session.user.email} · Log out
</button>
) : (
<button onClick={() => openAuth('signin')} className="text-[11px]" style={{ color: COLORS.slateLight }}>
Sign in to leave reviews
</button>
)}
</div>
</div>

<button
onClick={() => setShowAdd(true)}
className="fixed rounded-full flex items-center justify-center shadow-lg"
style={{ bottom: 24, right: 24, width: 56, height: 56, background: COLORS.flagRed }}
aria-label="Add a spot"
>
<Plus size={24} color="white" />
</button>

{zipCheckDone && showZipGate && (
<div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(20,24,30,0.55)' }}>
<div className="w-full max-w-sm rounded-2xl p-6" style={{ background: COLORS.cardBg }}>
<div className="flex justify-center gap-1.5 mb-3">
{[0, 1, 2, 3].map((i) => <Star key={i} size={14} fill={COLORS.flagRed} color={COLORS.flagRed} />)}
</div>
<h2 className="sp-display text-xl font-bold text-center mb-1">What's your ZIP code?</h2>
<p className="text-xs text-center mb-4" style={{ color: COLORS.slate }}>
We'll show you Chicago-style spots near you. Just once — we remember it.
</p>
<input
value={zipInput}
onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
placeholder="e.g. 60614"
inputMode="numeric"
autoFocus
className="w-full text-center text-2xl sp-mono font-semibold rounded-xl px-3 py-3 mb-3 outline-none tracking-widest"
style={{ border: `1px solid ${COLORS.border}` }}
/>
<button
onClick={submitZip}
disabled={!zipValid || zipStatus === 'loading'}
className="w-full text-sm font-semibold rounded-lg py-3 mb-1 flex items-center justify-center gap-2"
style={{ background: zipValid ? COLORS.flagBlue : COLORS.border, color: zipValid ? 'white' : COLORS.slateLight }}
>
{zipStatus === 'loading' && <Loader2 size={16} className="animate-spin" />}
{zipStatus === 'loading' ? 'Looking up your ZIP…' : 'Show me the food'}
</button>
{zipError && <p className="text-xs text-center mb-2" style={{ color: COLORS.flagRed }}>{zipError}</p>}
<button onClick={skipZipGate} className="w-full text-xs py-2 mt-1" style={{ color: COLORS.slateLight }}>
Skip — just show me everything
</button>
</div>
</div>
)}

{showAuth && (
<div
className="fixed inset-0 flex items-center justify-center z-50 p-4"
style={{ background: 'rgba(20,24,30,0.55)' }}
onClick={closeAuth}
>
<div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-6" style={{ background: COLORS.cardBg }}>
<div className="flex items-center justify-between mb-1">
<h2 className="sp-display text-lg font-semibold">
{authMode === 'signup' ? 'Create an account' : 'Sign in'}
</h2>
<button onClick={closeAuth}>
<X size={20} color={COLORS.slate} />
</button>
</div>
<p className="text-xs mb-4" style={{ color: COLORS.slate }}>
{authMode === 'signup'
? 'Free account — leave reviews that stick around for everyone to see.'
: 'Welcome back.'}
</p>

<div className="relative mb-2">
<Mail size={14} style={{ position: 'absolute', left: 10, top: 11, color: COLORS.slateLight }} />
<input
value={authEmail}
onChange={(e) => setAuthEmail(e.target.value)}
placeholder="you@email.com"
autoCapitalize="none"
autoCorrect="off"
className="w-full text-sm rounded-lg pl-8 pr-3 py-2.5 outline-none"
style={{ border: `1px solid ${COLORS.border}` }}
/>
</div>
<div className="relative mb-2">
<Lock size={14} style={{ position: 'absolute', left: 10, top: 11, color: COLORS.slateLight }} />
<input
value={authPassword}
onChange={(e) => setAuthPassword(e.target.value)}
placeholder="Password (6+ characters)"
type="password"
className="w-full text-sm rounded-lg pl-8 pr-3 py-2.5 outline-none"
style={{ border: `1px solid ${COLORS.border}` }}
/>
</div>

{authError && <p className="text-xs mb-2" style={{ color: COLORS.flagRed }}>{authError}</p>}
{authMessage && <p className="text-xs mb-2" style={{ color: '#1F8A4C' }}>{authMessage}</p>}

<button
onClick={submitAuth}
disabled={!authValid || authLoading}
className="w-full text-sm font-semibold rounded-lg py-3 flex items-center justify-center gap-2 mb-3"
style={{ background: authValid ? COLORS.flagBlue : COLORS.border, color: authValid ? 'white' : COLORS.slateLight }}
>
{authLoading && <Loader2 size={16} className="animate-spin" />}
{authMode === 'signup' ? 'Sign up' : 'Sign in'}
</button>

<button
onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setAuthError(''); setAuthMessage(''); }}
className="w-full text-xs"
style={{ color: COLORS.slateLight }}
>
{authMode === 'signup' ? 'Already have an account? Sign in' : "New here? Create a free account"}
</button>
</div>
</div>
)}

{showAdd && (
<div
className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
style={{ background: 'rgba(20,24,30,0.5)' }}
onClick={() => { setShowAdd(false); resetForm(); }}
>
<div
onClick={(e) => e.stopPropagation()}
className="w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
style={{ background: COLORS.cardBg }}
>
<div className="flex items-center justify-between mb-4">
<h2 className="sp-display text-lg font-semibold">Add a spot</h2>
<button onClick={() => { setShowAdd(false); resetForm(); }}><X size={20} color={COLORS.slate} /></button>
</div>

<label className="text-xs font-medium block mb-1" style={{ color: COLORS.slate }}>Name</label>
<input
value={formName} onChange={(e) => setFormName(e.target.value)}
placeholder="e.g. Lou's Deep Dish"
className="w-full text-sm rounded-lg px-3 py-2.5 mb-3 outline-none"
style={{ border: `1px solid ${COLORS.border}` }}
/>

<label className="text-xs font-medium block mb-1" style={{ color: COLORS.slate }}>Category</label>
<select
value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
className="w-full text-sm rounded-lg px-3 py-2.5 mb-3 outline-none"
style={{ border: `1px solid ${COLORS.border}`, background: 'white' }}
>
{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
</select>

<label className="text-xs font-medium block mb-1" style={{ color: COLORS.slate }}>Description</label>
<textarea
value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
placeholder="What makes it worth the trip?"
rows={3}
className="w-full text-sm rounded-lg px-3 py-2.5 mb-3 outline-none resize-none"
style={{ border: `1px solid ${COLORS.border}` }}
/>

<label className="text-xs font-medium block mb-1" style={{ color: COLORS.slate }}>Your name (optional)</label>
<input
value={formSubmitter} onChange={(e) => setFormSubmitter(e.target.value)}
placeholder="Anonymous"
className="w-full text-sm rounded-lg px-3 py-2.5 mb-3 outline-none"
style={{ border: `1px solid ${COLORS.border}` }}
/>

<label className="text-xs font-medium block mb-1" style={{ color: COLORS.slate }}>Location</label>
<button
onClick={captureFormLocation}
className="w-full text-sm rounded-lg px-3 py-2.5 mb-1 flex items-center justify-center gap-2"
style={{ border: `1px solid ${COLORS.border}`, color: formLocStatus === 'done' ? '#1F8A4C' : COLORS.ink }}
>
{formLocStatus === 'fetching' && <Loader2 size={14} className="animate-spin" />}
<MapPin size={14} />
{formLocStatus === 'done' ? 'Location captured ✓' : 'Use my current location'}
</button>
{formLocStatus === 'error' && (
<p className="text-[11px] mb-2" style={{ color: COLORS.flagRed }}>Couldn't get your location — check permissions and try again.</p>
)}
<p className="text-[11px] mb-3" style={{ color: COLORS.slateLight }}>Stand at the spot (or near it) before capturing.</p>

{saveError && <p className="text-xs mb-2" style={{ color: COLORS.flagRed }}>{saveError}</p>}

<button
onClick={submitVendor}
disabled={!formName.trim() || !formLoc || submitting}
className="w-full text-sm font-semibold rounded-lg py-3 flex items-center justify-center gap-2"
style={{
background: (!formName.trim() || !formLoc) ? COLORS.border : COLORS.flagBlue,
color: (!formName.trim() || !formLoc) ? COLORS.slateLight : 'white',
}}
>
{submitting ? <Loader2 size={16} className="animate-spin" /> : null}
Add spot
</button>
</div>
</div>
)}

{selectedVendor && (() => {
const cat = categoryById(selectedVendor.category);
const Icon = cat.Icon;
const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : null;
return (
<div
className="fixed inset-0 flex items-end sm:items-center justify-center z-50"
style={{ background: 'rgba(20,24,30,0.5)' }}
onClick={closeVendor}
>
<div
onClick={(e) => e.stopPropagation()}
className="w-full max-w-md rounded-t-2xl sm:rounded-2xl max-h-[88vh] overflow-y-auto"
style={{ background: COLORS.cardBg }}
>
<div className="p-5 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
<div className="flex items-start justify-between gap-2 mb-2">
<div className="flex items-start gap-3 min-w-0">
<div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ width: 40, height: 40, background: cat.color }}>
<Icon size={19} color="white" />
</div>
<div className="min-w-0">
<h2 className="sp-display text-lg font-bold leading-snug">{selectedVendor.name}</h2>
<div className="flex items-center gap-2 mt-0.5 flex-wrap">
<span className="text-[11px] font-medium" style={{ color: cat.color }}>{cat.label}</span>
{avgRating != null && (
<span className="flex items-center gap-0.5 text-[11px] font-medium" style={{ color: COLORS.mustard }}>
<Star size={11} fill={COLORS.mustard} color={COLORS.mustard} /> {avgRating.toFixed(1)} ({reviews.length})
</span>
)}
</div>
</div>
</div>
<button onClick={closeVendor} className="flex-shrink-0"><X size={20} color={COLORS.slate} /></button>
</div>
{selectedVendor.description && (
<p className="text-xs leading-relaxed mb-2" style={{ color: COLORS.slate }}>{selectedVendor.description}</p>
)}
<div className="flex items-center justify-between">
<span className="text-[10px]" style={{ color: COLORS.slateLight }}>Added by {selectedVendor.addedBy}</span>
<a
href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVendor.lat},${selectedVendor.lng}`}
target="_blank" rel="noopener noreferrer"
className="flex items-center gap-1 text-xs font-medium"
style={{ color: COLORS.flagBlue }}
>
<Navigation size={12} /> Directions
</a>
</div>
{isAdmin && (
<button
onClick={() => deleteVendor(selectedVendor.id)}
className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
style={{ background: '#FDF1F1', color: COLORS.flagRed }}
>
<Trash2 size={13} /> Remove this spot
</button>
)}
</div>

{selectedVendor.menuItems && selectedVendor.menuItems.length > 0 && (
<div className="p-5 pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
<h3 className="text-xs font-semibold mb-2" style={{ color: COLORS.ink }}>Menu highlights</h3>
<div className="flex flex-col gap-1.5">
{selectedVendor.menuItems.map((item, i) => (
<div key={i} className="flex items-center justify-between text-sm">
<span style={{ color: COLORS.ink }}>{item.name}</span>
<span className="sp-mono text-xs" style={{ color: COLORS.slate }}>{formatPrice(item.price)}</span>
</div>
))}
</div>
<p className="text-[10px] mt-2" style={{ color: COLORS.slateLight }}>Estimated prices — always confirm at the counter.</p>
</div>
)}

<div className="p-5">
<h3 className="text-xs font-semibold mb-3" style={{ color: COLORS.ink }}>Reviews</h3>

{session ? (
<div className="mb-4 p-3 rounded-xl" style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}` }}>
<div className="flex items-center gap-1 mb-2">
{[1, 2, 3, 4, 5].map((n) => (
<button key={n} onClick={() => setReviewRating(n)} aria-label={`${n} star`}>
<Star size={20} fill={n <= reviewRating ? COLORS.mustard : 'none'} color={COLORS.mustard} />
</button>
))}
</div>
<textarea
value={reviewComment}
onChange={(e) => setReviewComment(e.target.value)}
placeholder="What'd you think?"
rows={2}
className="w-full text-sm rounded-lg px-3 py-2 mb-2 outline-none resize-none"
style={{ border: `1px solid ${COLORS.border}`, background: 'white' }}
/>
{reviewError && <p className="text-xs mb-2" style={{ color: COLORS.flagRed }}>{reviewError}</p>}
<button
onClick={submitReview}
disabled={submittingReview || !reviewComment.trim()}
className="text-xs font-semibold rounded-lg px-3 py-2 flex items-center gap-1.5"
style={{
background: reviewComment.trim() ? COLORS.flagBlue : COLORS.border,
color: reviewComment.trim() ? 'white' : COLORS.slateLight,
}}
>
{submittingReview ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
Post review
</button>
</div>
) : (
<button
onClick={() => openAuth('signup')}
className="w-full text-xs font-medium rounded-lg py-2.5 mb-4"
style={{ background: COLORS.bg, border: `1px dashed ${COLORS.border}`, color: COLORS.slate }}
>
Sign in to leave a review
</button>
)}

{loadingReviews && (
<div className="text-xs text-center py-4" style={{ color: COLORS.slateLight }}>Loading reviews…</div>
)}
{!loadingReviews && reviews.length === 0 && (
<p className="text-xs text-center py-4" style={{ color: COLORS.slateLight }}>No reviews yet — be the first.</p>
)}
<div className="flex flex-col gap-3">
{reviews.map((r) => (
<div key={r.id} className="pb-3" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
<div className="flex items-center justify-between mb-1">
<div className="flex items-center gap-1">
{[1, 2, 3, 4, 5].map((n) => (
<Star key={n} size={12} fill={n <= r.rating ? COLORS.mustard : 'none'} color={COLORS.mustard} />
))}
</div>
<span className="text-[10px]" style={{ color: COLORS.slateLight }}>{formatReviewDate(r.createdAt)}</span>
</div>
{r.comment && <p className="text-xs leading-relaxed mb-1" style={{ color: COLORS.ink }}>{r.comment}</p>}
<div className="flex items-center justify-between">
<span className="text-[10px]" style={{ color: COLORS.slateLight }}>{r.userEmail}</span>
{(isAdmin || (session && session.user && session.user.id === r.userId)) && (
<button onClick={() => deleteReview(r.id)} className="text-[10px]" style={{ color: COLORS.flagRed }}>
Delete
</button>
)}
</div>
</div>
))}
</div>
</div>
</div>
</div>
);
})()}
</div>
);
}
