'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSimulationStore } from '@/store/simulation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calculator, Euro, TrendingUp, TrendingDown, AlertTriangle, Home, FileText, Shield, Settings, Building2 } from 'lucide-react';

const rentAndChargesSchema = z.object({
  rentMonthly: z.number().min(0, 'Le loyer doit être positif'),
  chargesRecoverableMonthly: z.number().min(0, 'Les charges récupérables doivent être positives'),
  // Séparation des charges non récupérables
  propertyTaxMonthly: z.number().min(0, 'La taxe foncière doit être positive'),
  condoFeesMonthly: z.number().min(0, 'Les charges de copropriété doivent être positives'),
  managementFeesMonthly: z.number().min(0, 'Les frais de gestion doivent être positifs'),
  insuranceMonthly: z.number().min(0, 'L\'assurance doit être positive'),
  otherExpensesMonthly: z.number().min(0, 'Les autres charges doivent être positives'),
  vacancyRate: z.number().min(0, 'Le taux de vacance doit être positif').max(100, 'Le taux de vacance ne peut excéder 100%'),
});

type RentAndChargesForm = z.infer<typeof rentAndChargesSchema>;

export function StepRentAndCharges() {
  const { data, updateData } = useSimulationStore();

  const form = useForm<RentAndChargesForm>({
    resolver: zodResolver(rentAndChargesSchema),
    defaultValues: {
      rentMonthly: data.rentMonthly || 0,
      chargesRecoverableMonthly: data.chargesRecoverableMonthly || 0,
      propertyTaxMonthly: data.propertyTaxMonthly || 0,
      condoFeesMonthly: data.condoFeesMonthly || 0,
      managementFeesMonthly: data.managementFeesMonthly || 0,
      insuranceMonthly: data.insuranceMonthly || 0,
      otherExpensesMonthly: data.otherExpensesMonthly || 0,
      vacancyRate: data.vacancyRate || 5,
    },
    mode: 'onChange',
  });

  const watchedRentMonthly = form.watch('rentMonthly');
  const watchedChargesRecoverable = form.watch('chargesRecoverableMonthly');
  const watchedPropertyTax = form.watch('propertyTaxMonthly');
  const watchedCondoFees = form.watch('condoFeesMonthly');
  const watchedManagementFees = form.watch('managementFeesMonthly');
  const watchedInsurance = form.watch('insuranceMonthly');
  const watchedOtherExpenses = form.watch('otherExpensesMonthly');
  const watchedVacancyRate = form.watch('vacancyRate');

  // Calcul du total des charges non récupérables
  const totalNonRecoverableCharges = (watchedPropertyTax || 0) + (watchedCondoFees || 0) + 
    (watchedManagementFees || 0) + (watchedInsurance || 0) + (watchedOtherExpenses || 0);

  // Mise à jour du store en temps réel
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      updateData({
        rentMonthly: values.rentMonthly || 0,
        chargesRecoverableMonthly: values.chargesRecoverableMonthly || 0,
        propertyTaxMonthly: values.propertyTaxMonthly || 0,
        condoFeesMonthly: values.condoFeesMonthly || 0,
        managementFeesMonthly: values.managementFeesMonthly || 0,
        insuranceMonthly: values.insuranceMonthly || 0,
        otherExpensesMonthly: values.otherExpensesMonthly || 0,
        vacancyRate: values.vacancyRate || 0,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateData]);

  // Calculs pour les indicateurs
  const totalCost = (data.price || 0) + (data.notaryFees || 0);
  const grossAnnualRent = watchedRentMonthly * 12;
  const effectiveAnnualRent = grossAnnualRent * (1 - (watchedVacancyRate / 100));
  const grossYield = totalCost > 0 ? (grossAnnualRent / totalCost) * 100 : 0;
  const netYield = totalCost > 0 ? ((effectiveAnnualRent - (totalNonRecoverableCharges * 12)) / totalCost) * 100 : 0;

  const rentPerSquareMeter = data.surface && data.surface > 0 ? watchedRentMonthly / data.surface : 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-gray-600">
          Définissez les revenus et charges de votre bien. La séparation détaillée des charges permet une analyse plus précise.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Loyer mensuel */}
          <FormField
            control={form.control}
            name="rentMonthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Euro className="w-4 h-4" />
                  Loyer mensuel (hors charges)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1200"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Loyer perçu mensuellement, hors charges locatives
                  {data.surface && rentPerSquareMeter > 0 && (
                    <span className="block text-sm text-blue-600 mt-1">
                      {rentPerSquareMeter.toFixed(2)} €/m² ({data.surface} m²)
                    </span>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Charges récupérables */}
          <FormField
            control={form.control}
            name="chargesRecoverableMonthly"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  Charges récupérables
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="80"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Charges refacturées au locataire (eau, chauffage collectif, ascenseur...)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Charges non récupérables - Section détaillée */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Charges non récupérables (détail)
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Taxe foncière */}
              <FormField
                control={form.control}
                name="propertyTaxMonthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500" />
                      Taxe foncière
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Taxe foncière mensuelle (montant annuel ÷ 12)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Charges de copropriété */}
              <FormField
                control={form.control}
                name="condoFeesMonthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      Charges de copropriété
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Charges non récupérables de copropriété (travaux, réserves...)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Frais de gestion */}
              <FormField
                control={form.control}
                name="managementFeesMonthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-purple-500" />
                      Frais de gestion locative
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Agence immobilière, syndic, administration...
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assurance */}
              <FormField
                control={form.control}
                name="insuranceMonthly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      Assurance propriétaire
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="25"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Assurance PNO (propriétaire non occupant)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Autres charges */}
            <FormField
              control={form.control}
              name="otherExpensesMonthly"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-gray-500" />
                    Autres charges diverses
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="20"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Entretien, petits travaux, frais divers non prévus ailleurs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total des charges non récupérables */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-900">Total charges non récupérables :</span>
                  <span className="text-lg font-bold text-red-700">
                    {totalNonRecoverableCharges.toLocaleString('fr-FR')} €/mois
                  </span>
                </div>
                <div className="text-sm text-red-600 mt-1">
                  {(totalNonRecoverableCharges * 12).toLocaleString('fr-FR')} €/an
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Taux de vacance */}
          <FormField
            control={form.control}
            name="vacancyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Taux de vacance locative
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">%</span>
                      <Badge variant={watchedVacancyRate <= 5 ? 'default' : watchedVacancyRate <= 10 ? 'secondary' : 'destructive'}>
                        {watchedVacancyRate <= 5 ? 'Optimiste' : watchedVacancyRate <= 10 ? 'Réaliste' : 'Pessimiste'}
                      </Badge>
                    </div>
                    <Slider
                      value={[field.value || 0]}
                      onValueChange={(value: number[]) => field.onChange(value[0])}
                      max={20}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Pourcentage de l'année où le bien est vide (recommandé : 5-10%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Indicateurs de rentabilité */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Rentabilité brute</h3>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {grossYield.toFixed(2)}%
            </div>
            <div className="text-sm text-green-600 mt-1">
              {grossAnnualRent.toLocaleString('fr-FR')} € / {totalCost.toLocaleString('fr-FR')} €
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Rentabilité nette</h3>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {netYield.toFixed(2)}%
            </div>
            <div className="text-sm text-blue-600 mt-1">
              Après déduction des charges non récupérables
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conseils */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                💡 Conseils pour une estimation précise
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Taxe foncière : consultez votre dernier avis (montant annuel ÷ 12)</li>
                <li>Charges copropriété : demandez le budget prévisionnel au syndic</li>
                <li>Gestion locative : comptez 6-10% du loyer pour une agence</li>
                <li>Assurance PNO : 200-400€/an selon la valeur du bien</li>
                <li>Vacance locative : 5% = 18 jours, 8% = 1 mois par an</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 