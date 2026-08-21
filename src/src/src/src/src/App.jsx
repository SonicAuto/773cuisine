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
  { id: 'seed-19', name: "Portillo's (Kennesaw)", category: 'italian-beef', description: "Atlanta's first Portill
