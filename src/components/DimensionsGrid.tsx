'use client';

import { useState, useEffect } from 'react';
import { DIMENSIONS, getDimensionLevels, getRubricDataSync, type Dimension, type Level } from '@/lib/rubric-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const EMOJI: Record<Dimension, string> = {
  'Technology': '🧪',
  'Customer/Market': '🧭',
  'Business Model': '📈',
  'Team': '👥',
  'IP': '🔐',
  'Funding': '💶',
  'Sustainability': '🌱',
  'System Integration': '🔗',
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
                <span className="text-2xl">{EMOJI[d]}</span>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{active ? `${EMOJI[active]} ${active} — Levels 1–9` : 'Levels'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-2">
            {active && <LevelRows />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
