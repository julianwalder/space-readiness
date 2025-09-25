'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useVenture } from '@/contexts/VentureContext';
import { getStages, Stage, getStageById } from '@/lib/stages-service';
import { ChevronDownIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Remove duplicate Venture interface since it's imported from context

interface VentureSelectorProps {
  currentVentureId: string | null;
  onVentureChange: (ventureId: string | null) => void;
}

// Function to get badge colors based on stage
const getStageBadgeColors = (stage: string) => {
  const stageLower = stage.toLowerCase();
  
  if (stageLower === 'pre_seed') {
    return 'bg-purple-100 text-purple-700';
  } else if (stageLower === 'seed') {
    return 'bg-blue-100 text-blue-700';
  } else if (stageLower === 'series_a') {
    return 'bg-green-100 text-green-700';
  } else {
    // Default color for unknown stages
    return 'bg-gray-100 text-gray-600';
  }
};

export default function VentureSelector({ currentVentureId, onVentureChange }: VentureSelectorProps) {
  const { ventures, refreshVentures } = useVenture();
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newVentureName, setNewVentureName] = useState('');
  const [newVentureStage, setNewVentureStage] = useState('');
  const [newVentureDescription, setNewVentureDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);

  const currentVenture = ventures.find(v => v.id === currentVentureId);

  // Load stages on component mount
  useEffect(() => {
    async function loadStages() {
      try {
        const stagesData = await getStages();
        setStages(stagesData);
      } catch (error) {
        console.error('Error loading stages:', error);
      }
    }
    loadStages();
  }, []);

  // Remove the local loadVentures function since we're using the context

  const handleCreateVenture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVentureName.trim()) return;

    setIsCreating(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Please sign in to create a venture');
      }

      const ventureData: { name: string; stage?: string; description?: string; user_id: string } = { 
        name: newVentureName.trim(),
        user_id: user.id // associate venture with the current user
      };
      if (newVentureStage.trim()) {
        ventureData.stage = newVentureStage.trim();
      }
      if (newVentureDescription.trim()) {
        ventureData.description = newVentureDescription.trim();
      }

      const { data, error } = await supabase
        .from('ventures')
        .insert([ventureData])
        .select()
        .single();

      if (error) throw error;

      // Refresh the ventures list and select the new venture
      await refreshVentures(data.id);
      setNewVentureName('');
      setNewVentureStage('');
      setNewVentureDescription('');
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error creating venture:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Remove the loading check since we're using the context

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-48"
        >
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <span className="truncate text-left">
                {currentVenture ? currentVenture.name : 'Select Venture'}
              </span>
              {currentVenture?.stage && (
                <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${getStageBadgeColors(currentVenture.stage)}`}>
                  {getStageById(currentVenture.stage)?.name || currentVenture.stage}
                </span>
              )}
            </div>
          </div>
          <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              {/* Manage Venture Button - Only show if a venture is selected */}
              {currentVenture && (
                <>
                  <Link
                    href={`/venture/${currentVenture.id}`}
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    <span>Manage {currentVenture.name}</span>
                  </Link>
                  
                  {/* Divider */}
                  <div className="my-2 border-t border-gray-200"></div>
                </>
              )}

              {/* Existing Ventures */}
              <div className="max-h-48 overflow-y-auto">
                {ventures.map((venture) => (
                  <button
                    key={venture.id}
                    onClick={() => {
                      onVentureChange(venture.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      venture.id === currentVentureId
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div className="font-medium truncate">{venture.name}</div>
                        {venture.stage && (
                          <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${getStageBadgeColors(venture.stage)}`}>
                            {getStageById(venture.stage)?.name || venture.stage}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {ventures.length === 0 && (
                <div className="px-3 py-4 text-sm text-gray-500 text-center">
                  No ventures yet. Create your first one!
                </div>
              )}

              {/* Divider before Create New */}
              {ventures.length > 0 && (
                <div className="my-2 border-t border-gray-200"></div>
              )}

              {/* Create New Venture Button - Moved to bottom */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsDrawerOpen(true);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create new venture</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer - Separate from dropdown */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Create New Venture</DrawerTitle>
              <DrawerDescription>
                Enter the name for your new space venture.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <form onSubmit={handleCreateVenture}>
                <div className="mb-4">
                  <label htmlFor="venture-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Venture Name
                  </label>
                  <Input
                    id="venture-name"
                    type="text"
                    value={newVentureName}
                    onChange={(e) => setNewVentureName(e.target.value)}
                    placeholder="Enter venture name..."
                    autoFocus
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="venture-stage" className="block text-sm font-medium text-gray-700 mb-2">
                    Stage (Optional)
                  </label>
                  <Select value={newVentureStage} onValueChange={setNewVentureStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-6">
                  <label htmlFor="venture-description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="venture-description"
                    value={newVentureDescription}
                    onChange={(e) => setNewVentureDescription(e.target.value)}
                    placeholder="Enter venture description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </form>
            </div>
            <DrawerFooter>
              <Button
                onClick={handleCreateVenture}
                disabled={isCreating || !newVentureName.trim()}
                className="w-full"
              >
                {isCreating ? 'Creating...' : 'Create Venture'}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNewVentureName('');
                    setNewVentureStage('');
                    setNewVentureDescription('');
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}