'use client';

import { useState, useEffect } from 'react';
import { DIMENSIONS, getDimensionLevels, getRubricDataSync, type Dimension, type Level } from '@/lib/rubric-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const DIMENSION_ICONS: Record<Dimension, React.ReactNode> = {
  'Technology': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  'Customer/Market': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'Business Model': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'Team': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  'IP': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  'Funding': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'Sustainability': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  'System Integration': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
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
          <Card key={d} className="hover:shadow-sm transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="text-blue-600">{DIMENSION_ICONS[d]}</div>
                <span>{d}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                1–9 levels with evidence-backed criteria.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => openDim(d)}>
                View levels
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {active && <div className="text-blue-600">{DIMENSION_ICONS[active]}</div>}
              {active ? `${active} — Levels 1–9` : 'Levels'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            {active && <LevelRows />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
