'use client';

import { useState, useEffect } from 'react';
import { DIMENSIONS, getDimensionLevels, getRubricDataSync, type Dimension, type Level } from '@/lib/rubric-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const DIMENSION_DESCRIPTIONS: Record<Dimension, string> = {
  'Technology': 'Technical feasibility and innovation readiness for space environment.',
  'Customer/Market': 'Market demand validation and competitive positioning.',
  'Business Model': 'Revenue streams, cost structure, and scalability framework.',
  'Team': 'Founding team expertise and execution capability.',
  'IP': 'Intellectual property portfolio and competitive moats.',
  'Funding': 'Capital requirements and investor readiness.',
  'Sustainability': 'Environmental impact and regulatory compliance.',
  'System Integration': 'Integration complexity and system-level validation.',
};

export default function DimensionsGrid() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Dimension | null>(null);
  const [levelDescriptions, setLevelDescriptions] = useState<Record<Level, string>>({} as Record<Level, string>);
  const [, setIsLoading] = useState(false);

  const openDim = (d: Dimension) => { 
    setActive(d); 
    setOpen(true);
  };

  // Load descriptions when dialog opens
  useEffect(() => {
    if (active && open) {
      const loadDescriptions = async () => {
        try {
          // First try to get data synchronously from cache
          const cachedRubric = getRubricDataSync();
          if (cachedRubric && cachedRubric[active]) {
            setLevelDescriptions(cachedRubric[active]);
            setIsLoading(false);
            return;
          }

          // If not in cache, load asynchronously
          setIsLoading(true);
          const descriptions = await getDimensionLevels(active);
          setLevelDescriptions(descriptions);
        } catch (error) {
          console.error('Error loading level descriptions:', error);
          setLevelDescriptions({} as Record<Level, string>);
        } finally {
          setIsLoading(false);
        }
      };
      loadDescriptions();
    }
  }, [active, open]);

  const LevelRows = () => {
    const levels: Level[] = [1,2,3,4,5,6,7,8,9];
    
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Level</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {levels.map((lv) => (
            <TableRow key={lv}>
              <TableCell className="font-medium">{lv}</TableCell>
              <TableCell>{levelDescriptions[lv] || `Level ${lv}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-4">
        {DIMENSIONS.map((d) => (
          <Card 
            key={d} 
            className="hover:shadow-sm transition flex flex-col h-full cursor-pointer" 
            onClick={() => openDim(d)}
          >
            <CardHeader>
              <CardTitle>
                {d}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <p className="text-sm text-muted-foreground flex-grow">
                {DIMENSION_DESCRIPTIONS[d]}
              </p>
              <div className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-4 text-left">
                View {d.toLowerCase()} levels
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>
                {active ? `${active} — Levels 1–9` : 'Levels'}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              {active && <LevelRows />}
            </div>
          </DialogContent>
        </Dialog>
    </>
  );
}
