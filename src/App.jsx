import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Search, Navigation, Pizza, Beef, Truck, Flame, Star, Loader2, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const ADMIN_EMAILS = ['joshmckenzie473@yahoo.com', 'bjohnson0987@gmail.com'];
const ZIP_STORAGE_KEY = '773cuisine-zip-location';
const ADMIN_STORAGE_KEY = '773cuisine-is-admin';

const rowToVendor = (r) => ({
  id: r.id, name: r.name, category: r.category, description: r.description,
  lat: r.lat, lng: r.lng, addedBy: r.added_by, addedAt: r.added_at,
});
const vendorToRow = (v) => ({
  id: v.id, name: v.name, category: v.category, description: v.description,
  lat: v.lat, lng: v.lng, added_by: v.addedBy, added_at: v.addedAt,
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
};

const CATEGORIES = [
  { id: 'deep-dish', label: 'Deep Dish', color: COLORS.flagBlue, Icon: Pizza },
  { id: 'tavern', label: 'Tavern-Style', color: COLORS.flagBlueLight, Icon: Pizza },
  { id: 'hot-dog', label: 'Hot Dog', color: COLORS.mustard, Icon: Flame },
  { id: 'italian-beef', label: 'Italian Beef', color: COLORS.flagRed, Icon: Beef },
  { id: 'food-truck', label: 'Food Truck', color: COLORS.slate, Icon: Truck },
  { id: 'other', label: 'Other', color: '#8A6D3B', Icon: Star },
];

const categoryById = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const SEED_VENDORS = [
  { id: 'seed-1', name: "Lou Malnati's Pizzeria", category: 'deep-dish', description: "The OG stuffed deep dish since 1971 — butter crust, chunky tomato sauce on top.", lat: 41.8907, lng: -87.6343, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-2', name: "Pequod's Pizza", category: 'deep-dish', description: "Caramelized cheese crust that fights back. Worth the wait.", lat: 41.9226, lng: -87.6644, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-3', name: "Portillo's (Clark St)", category: 'italian-beef', description: "Chicago dogs and dipped Italian beef, slinging since 1963.", lat: 41.8917, lng: -87.6296, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-4', name: "Al's Beef (Original)", category: 'italian-beef', description: "The Taylor St original. Get it dipped, hot peppers non-negotiable.", lat: 41.8695, lng: -87.6558, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-5', name: 'Superdawg Drive-In', category: 'hot-dog', description: "Car-hop drive-in slinging Chicago dogs since 1948. No ketchup, ever.", lat: 41.9967, lng: -87.7864, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-6', name: "Gene & Jude's", category: 'hot-dog', description: "Fries in the dog, no tomato, sport peppers only. Purists' pick.", lat: 41.9308, lng: -87.8378, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-7', name: "Pizano's Pizza & Pasta", category: 'tavern', description: "Thin, cracker-crust tavern-style pizza, cut in squares.", lat: 41.8819, lng: -87.6256, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-8', name: "The Wiener's Circle", category: 'hot-dog', description: "Late-night dog stand famous for the free insults with your order.", lat: 41.9298, lng: -87.6438, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-9', name: "Portillo's (Chandler)", category: 'italian-beef', description: "Chicago dogs and dipped beef in the Valley of the Sun.", lat: 33.3062, lng: -111.8413, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-10', name: "Portillo's (Frisco)", category: 'italian-beef', description: "DFW's take on the Chicago classics — beef, dogs, chocolate cake.", lat: 33.1507, lng: -96.8236, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-11', name: "Portillo's (Katy)", category: 'italian-beef', description: "Houston-area Portillo's bringing the Chicago street food menu south.", lat: 29.7858, lng: -95.8244, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-12', name: "Portillo's (Brandon)", category: 'italian-beef', description: "Florida's first Portillo's, open since 2016.", lat: 27.9378, lng: -82.2859, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-13', name: "Portillo's (Orlando)", category: 'italian-beef', description: "Chicago dogs and dipped beef near the theme parks.", lat: 28.5383, lng: -81.3792, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-14', name: "Portillo's (Avon)", category: 'italian-beef', description: "Indianapolis-area Portillo's serving the classics.", lat: 39.7625, lng: -86.4008, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-15', name: "Portillo's (Twin Cities)", category: 'italian-beef', description: "Minneapolis-area outpost of the Chicago hot dog empire.", lat: 44.9483, lng: -93.3477, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-16', name: "Portillo's (Wauwatosa)", category: 'italian-beef', description: "Milwaukee-area Portillo's, close enough to still count as home turf.", lat: 43.0505, lng: -88.0076, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-17', name: "Portillo's (Livonia)", category: 'italian-beef', description: "Detroit-suburb Portillo's for the transplants.", lat: 42.3684, lng: -83.3527, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-18', name: "Portillo's (Davenport)", category: 'italian-beef', description: "Serving the Quad Cities on both sides of the Mississippi.", lat: 41.5236, lng: -90.5776, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-19', name: "Portillo's (Kennesaw)", category: 'italian-beef', description: "Atlanta's first Portillo's, opened 2025.", lat: 34.0234, lng: -84.6155, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-20', name: "Portillo's (Buena Park)", category: 'italian-beef', description: "Portillo's first California location, open since 2006.", lat: 33.8675, lng: -117.9981, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-21', name: "Lou Malnati's (Scottsdale)", category: 'deep-dish', description: "Deep dish in the desert — same crust, same butter.", lat: 33.4942, lng: -111.9261, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-22', name: "Lou Malnati's (Arcadia, Phoenix)", category: 'deep-dish', description: "Phoenix-area stuffed deep dish, shipped-in-spirit from Buffalo Grove.", lat: 33.5006, lng: -112.0079, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-23', name: "Lou Malnati's (Carmel)", category: 'deep-dish', description: "Indianapolis-area deep dish from the Malnati family.", lat: 39.9784, lng: -86.1180, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed-24', name: "Lou Malnati's (Wauwatosa)", category: 'deep-dish', description: "Milwaukee-area deep dish outpost.", lat: 43.0505, lng: -88.0076, addedBy: '773cuisine', addedAt: '2024-01-01T00:00:00.000Z' },
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminError, setAdminError] = useState('');

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
            else setVendors(SEED_VENDORS); // still show something even if the seed insert failed
          }
        }
      } catch (e) {
        if (!cancelled) setVendors(SEED_VENDORS); // offline / unreachable fallback
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
    try {
      if (localStorage.getItem(ADMIN_STORAGE_KEY) === 'true') setIsAdmin(true);
    } catch (e) { /* not signed in as admin yet */ }
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

  const submitAdminEmail = () => {
    if (ADMIN_EMAILS.includes(adminEmailInput.trim().toLowerCase())) {
      setIsAdmin(true);
      try { localStorage.setItem(ADMIN_STORAGE_KEY, 'true'); } catch (e) {}
      setShowAdminGate(false);
      setAdminEmailInput('');
      setAdminError('');
    } else {
      setAdminError("That email isn't an admin on 773cuisine.");
    }
  };

  const signOutAdmin = () => {
    if (!window.confirm('Sign out of admin?')) return;
    setIsAdmin(false);
    try { localStorage.setItem(ADMIN_STORAGE_KEY, 'false'); } catch (e) {}
  };

  const deleteVendor = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm('Remove this spot from 773cuisine?')) return;
    try {
      const { error } = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
      setVendors((prev) => prev.filter((v) => v.id !== id));
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

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: COLORS.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');
