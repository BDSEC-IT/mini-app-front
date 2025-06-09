'use client';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import CalculateInterest from './calculate-interest/calculate-interest';
import { MSEBond } from '../../mse/_components/mse-overview-table';

export default function CardWithForm({
  bonds,
  otcBonds
}: {
  bonds: MSEBond[];
  otcBonds: MSEBond[] | null;
}) {
  return (
    <Card className="flex h-[63dvh] flex-col">
      {/* <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader> */}
      <CardContent className="mt-10 ">
        <CalculateInterest bonds={bonds} otcBonds={otcBonds} />
      </CardContent>
      <CardFooter className="mt-auto flex justify-between">
        {/* <Button variant="outline">Cancel</Button> */}
      </CardFooter>
    </Card>
  );
}
