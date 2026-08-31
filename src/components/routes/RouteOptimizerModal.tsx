import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Sparkles,
  ExternalLink,
  Clock,
  Car,
  CheckCircle2,
  Plus,
  Trash2,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Search,
  Route,
  X,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useItems } from '../../context/ItemsContext';
import { LifeItem, RouteWaypoint } from '../../types';
import { generateOptimizedRoute } from '../../utils/routeOptimizer';
import { getCategoryInfo } from '../../utils/categoryHelpers';

interface RouteOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedItemId?: string | null;
}

export const RouteOptimizerModal: React.FC<RouteOptimizerModalProps> = () => {
  const {
    items,
    isRouteOptimizerOpen,
    setIsRouteOptimizerOpen,
    isPro,
    openSubscriptionUpgrade,
    updateItem,
  } = useItems();

  // Find all items that have either a location or an address
  const eligibleItems = useMemo(() => {
    return items.filter(
      (item) => !item.completed && (item.location || item.locationAddress || item.vendor)
    );
  }, [items]);

  // Selected item IDs for the route
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [startAddress, setStartAddress] = useState('Home (Current Location)');
  const [isAddingCustomStop, setIsAddingCustomStop] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customPlace, setCustomPlace] = useState('');

  // Initialize selected items if empty
  React.useEffect(() => {
    if (isRouteOptimizerOpen && selectedItemIds.length === 0) {
      // Pick all items with explicit addresses, or first 3-4 eligible items
      const itemsWithRealLocations = eligibleItems.filter((i) => i.locationAddress || i.location);
      if (itemsWithRealLocations.length > 0) {
        setSelectedItemIds(itemsWithRealLocations.map((i) => i.id));
      } else if (eligibleItems.length > 0) {
        setSelectedItemIds(eligibleItems.slice(0, 3).map((i) => i.id));
      }
    }
  }, [isRouteOptimizerOpen, eligibleItems]);

  const activeItemsForRoute = useMemo(() => {
    return eligibleItems.filter((item) => selectedItemIds.includes(item.id));
  }, [eligibleItems, selectedItemIds]);

  // Compute optimized route
  const routePlan = useMemo(() => {
    return generateOptimizedRoute(activeItemsForRoute, startAddress);
  }, [activeItemsForRoute, startAddress]);

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleAddCustomStop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customAddress) return;

    // Create a temporary life item with this location
    const newItem: LifeItem = {
      id: `custom-stop-${Date.now()}`,
      userId: 'user-current',
      title: customTitle,
      description: `Custom route waypoint: ${customPlace || customTitle}`,
      category: 'other',
      priority: 'medium',
      date: new Date().toISOString().split('T')[0],
      time: null,
      reminderDate: null,
      reminderTiming: null,
      amount: null,
      vendor: customPlace || customTitle,
      location: customPlace || customTitle,
      locationAddress: customAddress,
      recurring: false,
      recurringFrequency: null,
      autoPay: false,
      warrantyLengthMonths: null,
      warrantyExpirationDate: null,
      tags: ['errand', 'route'],
      completed: false,
      completedAt: null,
      attachments: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    eligibleItems.push(newItem);
    setSelectedItemIds((prev) => [...prev, newItem.id]);
    setCustomTitle('');
    setCustomAddress('');
    setCustomPlace('');
    setIsAddingCustomStop(false);
  };

  if (!isRouteOptimizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        onClick={() => setIsRouteOptimizerOpen(false)}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 z-10 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Errand Route Optimizer</span>
              {!isPro && (
                <span className="ml-1 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                  Pro Feature
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              Fastest Multi-Stop Itinerary
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Automatically calculate the shortest driving circuit between appointments, errands, stores, and appointments to eliminate wasted travel time.
            </p>
          </div>

          <button
            onClick={() => setIsRouteOptimizerOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pro Upgrade Notice (if not Pro) */}
        {!isPro && (
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border-b border-amber-200/60 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 px-6">
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <div>
                <strong className="text-slate-900 dark:text-white">Previewing Pro Route Generator:</strong> Upgrade to Pro ($7.99/mo) for unlimited address geocoding, multi-waypoint optimization, and 1-click live navigation.
              </div>
            </div>
            <button
              onClick={() => openSubscriptionUpgrade()}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-400/20 whitespace-nowrap active:scale-95 transition-all cursor-pointer"
            >
              Upgrade to Pro ($7.99)
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Starting Origin Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Starting Departure Point</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={startAddress}
                onChange={(e) => setStartAddress(e.target.value)}
                placeholder="e.g. Home, 123 Main St, or Current Location"
                className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
              <button
                onClick={() => setStartAddress('Home (Current Location)')}
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Reset Home
              </button>
            </div>
          </div>

          {/* Quick Item Location Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Stops & Errands to Route ({activeItemsForRoute.length} selected)</span>
              </h3>
              <button
                onClick={() => setIsAddingCustomStop(!isAddingCustomStop)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingCustomStop ? 'Cancel Custom Stop' : 'Add Custom Address'}</span>
              </button>
            </div>

            {/* Custom Stop Inline Form */}
            {isAddingCustomStop && (
              <form
                onSubmit={handleAddCustomStop}
                className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3"
              >
                <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Add New Destination / Errand Stop
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Stop Title (e.g. Dry Cleaners, Post Office)"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Address or Venue (e.g. 820 Market St, San Francisco)"
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Insert Stop into Route
                </button>
              </form>
            )}

            {/* Stops Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eligibleItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                const categoryInfo = getCategoryInfo(item.category);
                const addressDisplay = item.locationAddress || item.location || 'Local Destination';

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelection(item.id)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                          {categoryInfo.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{addressDisplay}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Computed Itinerary & Route Stats */}
          {activeItemsForRoute.length > 0 ? (
            <div className="space-y-4 pt-2">
              {/* Route Summary Metric Banner */}
              <div className="p-5 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      Optimal Sequence Computed
                    </span>
                    <span className="text-xs text-slate-400">{routePlan.savingsSummary}</span>
                  </div>
                  <div className="flex items-baseline gap-4 pt-1">
                    <div>
                      <span className="text-2xl font-extrabold font-display text-white">
                        {routePlan.totalDuration}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">total driving</span>
                    </div>
                    <div className="border-l border-slate-700 pl-4">
                      <span className="text-2xl font-extrabold font-display text-white">
                        {routePlan.totalDistance}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">circuit</span>
                    </div>
                    <div className="border-l border-slate-700 pl-4">
                      <span className="text-2xl font-extrabold font-display text-emerald-400">
                        {routePlan.stopsCount}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">waypoints</span>
                    </div>
                  </div>
                </div>

                {/* Google Maps Deep Link Button */}
                <a
                  href={routePlan.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Start Navigation (Google Maps)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Waypoint Steps Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Step-by-Step Waypoint Order</span>
                </h4>

                <div className="space-y-2 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-200 dark:before:bg-slate-800">
                  {/* Origin */}
                  <div className="relative flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                    <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                      A
                    </div>
                    <div className="flex-1">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        Start: {routePlan.startLocation}
                      </h5>
                      <p className="text-[11px] text-slate-500">Departure origin • 9:30 AM</p>
                    </div>
                  </div>

                  {/* Waypoints */}
                  {routePlan.waypoints.map((waypoint, index) => {
                    const categoryInfo = getCategoryInfo(waypoint.category);
                    return (
                      <div
                        key={waypoint.itemId}
                        className="relative flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 z-10 shadow-xs">
                            {waypoint.order}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {waypoint.title}
                              </h5>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-medium">
                                {categoryInfo.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{waypoint.address}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
                            ~{waypoint.estimatedArrival}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            +{waypoint.distanceFromPrev} ({waypoint.durationFromPrev})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 space-y-2">
              <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-medium">
                No stops selected. Check one or more life items above or enter a custom address to generate an optimal route.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Powered by LifeOS Google Maps Route Engine
          </span>
          <button
            onClick={() => setIsRouteOptimizerOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
