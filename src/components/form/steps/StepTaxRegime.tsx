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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Calculator, Percent, FileText, AlertTriangle, Info, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

const taxRegimeSchema = z.object({
  regime: z.enum([
    'micro-foncier',
    'réel-foncier', 
    'micro-BIC',
    'réel-BIC',
    'LMNP-réel',
    'LMP-réel',
    'Pinel',
    'Denormandie',
    'Malraux'
  ], {
    required_error: 'Veuillez sélectionner un régime fiscal'
  }),
  taxpayerTMI: z.number().min(0).max(60, 'TMI invalide'),
  resaleYear: z.number().int().min(0).max(30),
  appreciationRate: z.number().min(-10).max(15),
  subOptions: z.object({
    pinelDuration: z.number().optional(),
    worksAmount: z.number().min(0).optional(),
    lmnpIsLMP: z.boolean().optional(),
    meubleTourismeClasse: z.boolean().optional()
  }).optional(),
});

type TaxRegimeForm = z.infer<typeof taxRegimeSchema>;

const TAX_BRACKETS = [
  { min: 0, max: 11294, rate: 0, label: '0% (non imposable)' },
  { min: 11295, max: 28797, rate: 11, label: '11%' },
  { min: 28798, max: 82341, rate: 30, label: '30%' },
  { min: 82342, max: 177106, rate: 41, label: '41%' },
  { min: 177107, max: Infinity, rate: 45, label: '45%' },
];

const REGIMES = [
  {
    value: 'micro-foncier' as const,
    label: 'Micro-foncier',
    description: 'Abattement forfaitaire de 30%',
    conditions: 'Revenus ≤ 15 000€/an',
    icon: '🏠',
    compatible: ['neuf', 'ancien'],
    pros: ['Simple', 'Abattement 30%', 'Pas de déclaration détaillée'],
    cons: ['Plafond 15k€', 'Pas de déduction travaux']
  },
  {
    value: 'réel-foncier' as const,
    label: 'Réel foncier',
    description: 'Déduction charges réelles',
    conditions: 'Tous revenus, charges déductibles',
    icon: '📊',
    compatible: ['neuf', 'ancien'],
    pros: ['Toutes charges déductibles', 'Pas de plafond', 'Déficits reportables'],
    cons: ['Comptabilité complexe', 'Déclarations détaillées']
  },
  {
    value: 'micro-BIC' as const,
    label: 'Micro-BIC',
    description: 'Abattement 50% ou 30%',
    conditions: 'Revenus ≤ 77 700€ (15k€ si saisonnier non classé)',
    icon: '🛏️',
    compatible: ['saisonnier'],
    pros: ['Simple', 'Abattement important', 'Pas de TVA'],
    cons: ['Plafond strict', 'Réforme 2025', 'Pas de déduction']
  },
  {
    value: 'LMNP-réel' as const,
    label: 'LMNP réel',
    description: 'Amortissement mobilier + immeuble',
    conditions: 'Location meublée non professionnelle',
    icon: '🏡',
    compatible: ['neuf', 'ancien', 'saisonnier'],
    pros: ['Amortissement', 'Déficits reportables', 'Optimisation fiscale'],
    cons: ['Comptabilité', 'Récupération TVA complexe']
  },
  {
    value: 'Pinel' as const,
    label: 'Dispositif Pinel',
    description: 'Réduction d\'impôt sur neuf',
    conditions: 'Neuf en zone éligible',
    icon: '🆕',
    compatible: ['neuf'],
    pros: ['Réduction impôt 10-21%', 'Loyer garanti', 'Défiscalisation'],
    cons: ['Contraintes location', 'Plafonds loyers', 'Engagement long']
  },
  {
    value: 'Denormandie' as const,
    label: 'Dispositif Denormandie',
    description: 'Réduction d\'impôt avec travaux',
    conditions: 'Ancien avec 25% travaux minimum',
    icon: '🔨',
    compatible: ['ancien'],
    pros: ['Réduction impôt 12-21%', 'Valorisation bien', 'Centres-villes'],
    cons: ['Travaux obligatoires', 'Zones limitées', 'Contraintes']
  }
];

export function StepTaxRegime() {
  const { data, updateData } = useSimulationStore();

  const form = useForm<TaxRegimeForm>({
    resolver: zodResolver(taxRegimeSchema),
    defaultValues: {
      regime: data.regime || undefined,
      taxpayerTMI: data.taxpayerTMI || 30,
      resaleYear: data.resaleYear || 10,
      appreciationRate: data.appreciationRate || 2,
      subOptions: data.subOptions || {},
    },
    mode: 'onChange',
  });

  const watchedRegime = form.watch('regime');
  const watchedTMI = form.watch('taxpayerTMI');
  const watchedResaleYear = form.watch('resaleYear');
  const watchedAppreciationRate = form.watch('appreciationRate');

  // Mise à jour du store en temps réel
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      updateData({
        regime: values.regime,
        taxpayerTMI: values.taxpayerTMI || 0,
        resaleYear: values.resaleYear || 0,
        appreciationRate: values.appreciationRate || 0,
        subOptions: values.subOptions || {},
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateData]);

  // Filtrer les régimes compatibles
  const compatibleRegimes = REGIMES.filter(regime => 
    regime.compatible.includes(data.propertyType || 'neuf')
  );

  // Validation des plafonds
  const annualRent = (data.rentMonthly || 0) * 12;
  const canUseMicroFoncier = annualRent <= 15000;
  const canUseMicroBIC = data.propertyType === 'saisonnier' 
    ? annualRent <= (data.subOptions?.meubleTourismeClasse ? 77700 : 15000)
    : annualRent <= 77700;

  const getRegimeWarning = (regimeValue: string) => {
    if (regimeValue === 'micro-foncier' && !canUseMicroFoncier) {
      return 'Revenus supérieurs à 15 000€ - micro-foncier indisponible';
    }
    if (regimeValue === 'micro-BIC' && !canUseMicroBIC) {
      return 'Revenus supérieurs au plafond micro-BIC';
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-gray-600">
          Choisissez votre régime fiscal en fonction de votre situation et optimisez votre imposition.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Sélection du régime fiscal */}
          <FormField
            control={form.control}
            name="regime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold">Régime fiscal</FormLabel>
                <FormDescription>
                  Régimes compatibles avec un bien {data.propertyType} 
                  (revenus annuels : {annualRent.toLocaleString('fr-FR')} €)
                </FormDescription>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {compatibleRegimes.map((regime) => {
                    const isSelected = field.value === regime.value;
                    const warning = getRegimeWarning(regime.value);
                    const isDisabled = !!warning;
                    
                    return (
                      <Card
                        key={regime.value}
                        className={`cursor-pointer transition-all ${
                          isDisabled 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isSelected 
                              ? 'ring-2 ring-primary border-primary shadow-lg' 
                              : 'hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => !isDisabled && field.onChange(regime.value)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{regime.icon}</span>
                              <h3 className="font-semibold">{regime.label}</h3>
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{regime.description}</p>
                          <p className="text-xs text-gray-500 mb-3">{regime.conditions}</p>
                          
                          {warning && (
                            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                              ⚠️ {warning}
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="text-xs">
                              <span className="font-medium text-green-700">Avantages :</span>
                              <ul className="list-disc list-inside text-green-600 ml-2">
                                {regime.pros.map((pro, index) => (
                                  <li key={index}>{pro}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-xs">
                              <span className="font-medium text-red-700">Inconvénients :</span>
                              <ul className="list-disc list-inside text-red-600 ml-2">
                                {regime.cons.map((con, index) => (
                                  <li key={index}>{con}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Options spécifiques selon le régime */}
          {watchedRegime === 'micro-BIC' && data.propertyType === 'saisonnier' && (
            <FormField
              control={form.control}
              name="subOptions.meubleTourismeClasse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Meublé de tourisme classé
                    </FormLabel>
                    <FormDescription>
                      Classement préfectoral (étoiles) - plafond 77 700€ au lieu de 15 000€
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {watchedRegime === 'Pinel' && (
            <FormField
              control={form.control}
              name="subOptions.pinelDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée d'engagement Pinel</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la durée" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="6">6 ans (10% de réduction)</SelectItem>
                      <SelectItem value="9">9 ans (15% de réduction)</SelectItem>
                      <SelectItem value="12">12 ans (21% de réduction)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Plus la durée est longue, plus la réduction d'impôt est importante
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(watchedRegime === 'Denormandie' || watchedRegime === 'Malraux') && (
            <FormField
              control={form.control}
              name="subOptions.worksAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant des travaux</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="50000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchedRegime === 'Denormandie' 
                      ? 'Minimum 25% du prix d\'acquisition'
                      : 'Travaux de restauration en secteur sauvegardé'
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* TMI */}
            <FormField
              control={form.control}
              name="taxpayerTMI"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Tranche marginale d'imposition (TMI)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre TMI" />
                        </SelectTrigger>
                        <SelectContent>
                          {TAX_BRACKETS.map((bracket) => (
                            <SelectItem key={bracket.rate} value={bracket.rate.toString()}>
                              {bracket.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Votre tranche marginale d'imposition sur le revenu
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Horizon de revente */}
            <FormField
              control={form.control}
              name="resaleYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Horizon de revente
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                      <Slider
                        value={[field.value || 0]}
                        onValueChange={(value: number[]) => field.onChange(value[0])}
                        max={30}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Année prévue de revente (0 = pas de revente prévue)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Appréciation du bien */}
          <FormField
            control={form.control}
            name="appreciationRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Appréciation annuelle du bien
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="2.0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">% par an</span>
                      <Badge variant={watchedAppreciationRate >= 3 ? 'default' : watchedAppreciationRate >= 1 ? 'secondary' : 'destructive'}>
                        {watchedAppreciationRate >= 3 ? 'Optimiste' : watchedAppreciationRate >= 1 ? 'Conservateur' : 'Pessimiste'}
                      </Badge>
                    </div>
                    <Slider
                      value={[field.value || 0]}
                      onValueChange={(value: number[]) => field.onChange(value[0])}
                      max={8}
                      min={-2}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Estimation d'appréciation annuelle du prix du bien (inflation immobilière)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Informations complémentaires selon le régime */}
      {watchedRegime && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">
                  Informations sur le régime {REGIMES.find(r => r.value === watchedRegime)?.label}
                </h3>
                <div className="text-sm text-blue-700">
                  {watchedRegime === 'micro-foncier' && (
                    <div className="space-y-1">
                      <p>• Abattement forfaitaire de 30% sur les revenus fonciers</p>
                      <p>• Déclaration simplifiée via la déclaration de revenus</p>
                      <p>• Bascule automatique vers le réel si revenus {'>'}  15 000€</p>
                    </div>
                  )}
                  {watchedRegime === 'réel-foncier' && (
                    <div className="space-y-1">
                      <p>• Déduction de toutes les charges réelles (travaux, intérêts, etc.)</p>
                      <p>• Déficits fonciers reportables pendant 10 ans</p>
                      <p>• Déclaration 2044 obligatoire</p>
                    </div>
                  )}
                  {watchedRegime === 'LMNP-réel' && (
                    <div className="space-y-1">
                      <p>• Amortissement du mobilier (7 ans) et de l'immeuble (25-40 ans)</p>
                      <p>• Déficits reportables sur les revenus meublés uniquement</p>
                      <p>• Comptabilité de caisse obligatoire</p>
                    </div>
                  )}
                  {watchedRegime === 'Pinel' && (
                    <div className="space-y-1">
                      <p>• Réduction d'impôt de 10% à 21% du prix d'acquisition</p>
                      <p>• Plafonds de loyers et de revenus locataires</p>
                      <p>• Engagement de location pendant 6, 9 ou 12 ans</p>
                    </div>
                  )}
                  {watchedRegime === 'Denormandie' && (
                    <div className="space-y-1">
                      <p>• Réduction d'impôt de 12% à 21% du prix + travaux</p>
                      <p>• Travaux minimum 25% du prix d'acquisition</p>
                      <p>• Zones Action Cœur de Ville uniquement</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Avertissement réforme 2025 */}
      {watchedRegime === 'micro-BIC' && data.propertyType === 'saisonnier' && !form.watch('subOptions.meubleTourismeClasse') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-900">
                ⚠️ Réforme 2025 - Micro-BIC saisonnier
              </p>
              <p className="text-sm text-red-700">
                Le plafond micro-BIC pour les meublés de tourisme non classés passe de 77 700€ à 15 000€ en 2025. 
                Votre revenu actuel ({annualRent.toLocaleString('fr-FR')} €) 
                {annualRent > 15000 ? ' dépasse ce nouveau plafond.' : ' respecte ce nouveau plafond.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 