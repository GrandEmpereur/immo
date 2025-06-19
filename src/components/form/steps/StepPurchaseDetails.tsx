'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSimulationStore } from '@/store/simulation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, Euro, FileText, Home } from 'lucide-react';

const purchaseDetailsSchema = z.object({
  price: z.number().min(10000, 'Le prix doit être d\'au moins 10 000€'),
  notaryFees: z.number().min(0, 'Les frais de notaire ne peuvent pas être négatifs'),
  surface: z.number().min(1, 'La surface doit être supérieure à 0'),
  dpeClass: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G'], {
    required_error: 'Veuillez sélectionner une classe DPE'
  }),
});

type PurchaseDetailsForm = z.infer<typeof purchaseDetailsSchema>;

const DPE_CLASSES = [
  { value: 'A' as const, label: 'A - Très performant', color: 'bg-green-600' },
  { value: 'B' as const, label: 'B - Performant', color: 'bg-green-500' },
  { value: 'C' as const, label: 'C - Bon', color: 'bg-lime-500' },
  { value: 'D' as const, label: 'D - Moyen', color: 'bg-yellow-500' },
  { value: 'E' as const, label: 'E - Passable', color: 'bg-orange-500' },
  { value: 'F' as const, label: 'F - Médiocre', color: 'bg-red-500' },
  { value: 'G' as const, label: 'G - Mauvais', color: 'bg-red-600' },
];

export function StepPurchaseDetails() {
  const { data, updateData } = useSimulationStore();

  const form = useForm<PurchaseDetailsForm>({
    resolver: zodResolver(purchaseDetailsSchema),
    defaultValues: {
      price: data.price || 0,
      notaryFees: data.notaryFees || 0,
      surface: data.surface || 0,
      dpeClass: data.dpeClass || undefined,
    },
    mode: 'onChange',
  });

  const watchedPrice = form.watch('price');
  const watchedNotaryFees = form.watch('notaryFees');
  const watchedSurface = form.watch('surface');

  // Calcul automatique des frais de notaire basé sur le type de bien
  React.useEffect(() => {
    if (watchedPrice && data.propertyType) {
      const rate = data.propertyType === 'neuf' ? 2.5 : 7.5;
      const calculatedNotaryFees = watchedPrice * (rate / 100);
      form.setValue('notaryFees', Math.round(calculatedNotaryFees));
    }
  }, [watchedPrice, data.propertyType, form]);

  // Mise à jour du store en temps réel
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      updateData({
        price: values.price || 0,
        notaryFees: values.notaryFees || 0,
        surface: values.surface || 0,
        dpeClass: values.dpeClass,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateData]);

  const totalCost = watchedPrice + watchedNotaryFees;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-gray-600">
          Saisissez les détails de votre acquisition. Les frais de notaire sont calculés automatiquement selon le type de bien.
        </p>
      </div>

      <Form {...form}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Prix d'achat */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Prix d'achat
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="250000"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Prix d'acquisition du bien immobilier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Frais de notaire */}
          <FormField
            control={form.control}
            name="notaryFees"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Frais de notaire
                  <Badge variant="outline" className="text-xs">
                    Auto-calculé
                  </Badge>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="18750"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  {data.propertyType === 'neuf' ? '~2,5% du prix' : '~7,5% du prix'} (modifiable)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Surface */}
          <FormField
            control={form.control}
            name="surface"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Surface habitable
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="65"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Surface en m² (loi Carrez)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Classe DPE */}
          <FormField
            control={form.control}
            name="dpeClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe énergétique (DPE)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la classe DPE" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DPE_CLASSES.map((dpe) => (
                      <SelectItem key={dpe.value} value={dpe.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${dpe.color}`} />
                          {dpe.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Impact sur la location (gel des loyers pour F/G)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Avertissement DPE F/G */}
      {form.watch('dpeClass') && ['F', 'G'].includes(form.watch('dpeClass')!) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-red-600 rounded-full" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-900">
                ⚠️ Attention - DPE {form.watch('dpeClass')}
              </p>
              <p className="text-sm text-red-700">
                Les logements F et G sont soumis à un gel des loyers depuis 2022 et seront progressivement 
                interdits à la location (G en 2025, F en 2028). Prévoyez des travaux de rénovation énergétique.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Récapitulatif des coûts */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Récapitulatif</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Prix d'achat :</span>
                <span className="font-medium">{(watchedPrice || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de notaire :</span>
                <span className="font-medium">{(watchedNotaryFees || 0).toLocaleString('fr-FR')} €</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Surface :</span>
                <span className="font-medium">{watchedSurface || 0} m²</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Coût total :</span>
                  <span>{totalCost.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>
          </div>
          
          {watchedPrice && watchedSurface && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Prix au m² :</span>
                <span className="font-medium">{Math.round(watchedPrice / watchedSurface).toLocaleString('fr-FR')} €/m²</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 