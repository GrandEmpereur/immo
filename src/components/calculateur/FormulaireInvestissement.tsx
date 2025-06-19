'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Info, Calculator } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ParametresInvestissement } from '@/lib/types/calculator';
import { estimerFraisNotaire } from '@/lib/calculations/fiscal';

const schemaFormulaire = z.object({
  // Acquisition
  prixAchat: z.coerce.number().min(0, "Le prix d'achat doit être positif"),
  fraisNotaire: z.coerce.number().min(0, "Les frais de notaire doivent être positifs"),
  fraisAgence: z.coerce.number().min(0, "Les frais d'agence doivent être positifs"),
  travaux: z.coerce.number().min(0, "Le montant des travaux doit être positif"),
  apportPersonnel: z.coerce.number().min(0, "L'apport personnel doit être positif"),
  
  // Financement
  montantPret: z.coerce.number().min(0, "Le montant du prêt doit être positif"),
  dureePret: z.coerce.number().min(1).max(30, "La durée doit être entre 1 et 30 ans"),
  tauxPret: z.coerce.number().min(0).max(20, "Le taux doit être entre 0 et 20%"),
  assuranceEmprunteur: z.coerce.number().min(0).max(5, "L'assurance doit être entre 0 et 5%"),
  
  // Bien immobilier
  surface: z.coerce.number().min(1, "La surface doit être positive"),
  typeBien: z.enum(['ancien', 'neuf']),
  classeDPE: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  
  // Revenus locatifs
  loyerMensuel: z.coerce.number().min(0, "Le loyer mensuel doit être positif"),
  chargesRecuperables: z.coerce.number().min(0, "Les charges récupérables doivent être positives"),
  vacanceLocative: z.coerce.number().min(0).max(100, "La vacance doit être entre 0 et 100%"),
  
  // Charges annuelles
  chargesCopropriete: z.coerce.number().min(0, "Les charges de copropriété doivent être positives"),
  fraisEntretienGestion: z.coerce.number().min(0, "Les frais d'entretien doivent être positifs"),
  assuranceHabitation: z.coerce.number().min(0, "L'assurance habitation doit être positive"),
  taxeFonciere: z.coerce.number().min(0, "La taxe foncière doit être positive"),
  
  // Fiscalité
  locationType: z.enum(['nue', 'meublee']),
  regimeFiscal: z.enum(['micro', 'reel']),
  statusLoueur: z.enum(['lmnp', 'lmp']).optional(),
  dispositif: z.enum(['aucun', 'pinel', 'denormandie', 'malraux']),
  trancheMarginalImposition: z.coerce.number().min(0).max(50, "La TMI doit être entre 0 et 50%"),
  
  // Projections
  dureeProjection: z.coerce.number().min(1).max(30, "La durée de projection doit être entre 1 et 30 ans"),
  tauxInflationLoyers: z.coerce.number().min(-5).max(10, "L'inflation des loyers doit être entre -5 et 10%"),
  tauxInflationCharges: z.coerce.number().min(-5).max(10, "L'inflation des charges doit être entre -5 et 10%"),
  tauxAppreciationBien: z.coerce.number().min(-5).max(10, "L'appréciation du bien doit être entre -5 et 10%"),
  
  // Dispositifs spécifiques
  dureePinel: z.coerce.number().optional(),
  anneePinel: z.coerce.number().min(2020).max(2030).optional(),
  montantTravauxMalraux: z.coerce.number().min(0).optional(),
  zoneMalraux: z.enum(['secteur_sauvegarde', 'autre']).optional(),
});

type FormData = z.infer<typeof schemaFormulaire>;

interface Props {
  onSubmit: (data: ParametresInvestissement) => void;
  valeurs?: Partial<ParametresInvestissement>;
  loading?: boolean;
}

export function FormulaireInvestissement({ onSubmit, valeurs, loading }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schemaFormulaire),
    defaultValues: {
      prixAchat: valeurs?.prixAchat || 200000,
      fraisNotaire: valeurs?.fraisNotaire || 16000,
      fraisAgence: valeurs?.fraisAgence || 0,
      travaux: valeurs?.travaux || 0,
      apportPersonnel: valeurs?.apportPersonnel || 40000,
      
      montantPret: valeurs?.montantPret || 176000,
      dureePret: valeurs?.dureePret || 20,
      tauxPret: valeurs?.tauxPret || 3.5,
      assuranceEmprunteur: valeurs?.assuranceEmprunteur || 0.36,
      
      surface: valeurs?.surface || 50,
      typeBien: valeurs?.typeBien || 'ancien',
      classeDPE: valeurs?.classeDPE || 'D',
      
      loyerMensuel: valeurs?.loyerMensuel || 800,
      chargesRecuperables: valeurs?.chargesRecuperables || 0,
      vacanceLocative: valeurs?.vacanceLocative || 8,
      
      chargesCopropriete: valeurs?.chargesCopropriete || 1200,
      fraisEntretienGestion: valeurs?.fraisEntretienGestion || 800,
      assuranceHabitation: valeurs?.assuranceHabitation || 300,
      taxeFonciere: valeurs?.taxeFonciere || 1000,
      
      locationType: valeurs?.locationType || 'nue',
      regimeFiscal: valeurs?.regimeFiscal || 'micro',
      statusLoueur: valeurs?.statusLoueur || 'lmnp',
      dispositif: valeurs?.dispositif || 'aucun',
      trancheMarginalImposition: valeurs?.trancheMarginalImposition || 30,
      
      dureeProjection: valeurs?.dureeProjection || 20,
      tauxInflationLoyers: valeurs?.tauxInflationLoyers || 1.5,
      tauxInflationCharges: valeurs?.tauxInflationCharges || 2,
      tauxAppreciationBien: valeurs?.tauxAppreciationBien || 2,
      
      dureePinel: valeurs?.dureePinel || 9,
      anneePinel: valeurs?.anneePinel || new Date().getFullYear(),
      montantTravauxMalraux: valeurs?.montantTravauxMalraux || 0,
      zoneMalraux: valeurs?.zoneMalraux || 'autre',
    },
  });

  const locationType = form.watch('locationType');
  const dispositif = form.watch('dispositif');
  const typeBien = form.watch('typeBien');
  const prixAchat = form.watch('prixAchat');

  // Auto-calcul des frais de notaire
  React.useEffect(() => {
    if (prixAchat > 0) {
      const fraisEstimes = estimerFraisNotaire(prixAchat, typeBien);
      form.setValue('fraisNotaire', Math.round(fraisEstimes));
    }
  }, [prixAchat, typeBien, form]);

  const handleSubmit = (data: FormData) => {
    console.log('Données du formulaire soumises:', data);
    try {
      // Conversion pour dureePinel
      const convertedData = {
        ...data,
        dureePinel: data.dureePinel ? (data.dureePinel as 6 | 9 | 12) : undefined,
      };
      onSubmit(convertedData as ParametresInvestissement);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const InfoTooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1">
            {children}
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Calculateur de Rentabilité Immobilière
        </CardTitle>
        <CardDescription>
          Saisissez les paramètres de votre investissement immobilier pour calculer sa rentabilité détaillée.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="acquisition" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
                <TabsTrigger value="financement">Financement</TabsTrigger>
                <TabsTrigger value="revenus">Revenus</TabsTrigger>
                <TabsTrigger value="fiscalite">Fiscalité</TabsTrigger>
                <TabsTrigger value="projection">Projection</TabsTrigger>
              </TabsList>

              <TabsContent value="acquisition" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="prixAchat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Prix d'acquisition du bien immobilier hors frais">
                            Prix d'achat (€)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fraisNotaire"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Frais de notaire et taxes (~8% ancien, ~3% neuf)">
                            Frais de notaire (€)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Calculé automatiquement selon le type de bien
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fraisAgence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frais d'agence (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="travaux"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travaux initiaux (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="typeBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de bien</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ancien">Ancien</SelectItem>
                            <SelectItem value="neuf">Neuf</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surface"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surface (m²)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="classeDPE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Classe énergétique - F et G ont des restrictions">
                            Classe DPE
                          </InfoTooltip>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F ⚠️</SelectItem>
                            <SelectItem value="G">G ⚠️</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apportPersonnel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Capital propre investi">
                            Apport personnel (€)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="financement" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="montantPret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant du prêt (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dureePret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée du prêt (années)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tauxPret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux du prêt (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assuranceEmprunteur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assurance emprunteur (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="revenus" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="loyerMensuel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loyer mensuel (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargesRecuperables"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charges récupérables/mois (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vacanceLocative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Pourcentage de temps sans locataire">
                            Vacance locative (%)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chargesCopropriete"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Charges copropriété/an (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fraisEntretienGestion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Frais de gestion, entretien, réparations">
                            Entretien et gestion/an (€)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assuranceHabitation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assurance PNO/an (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxeFonciere"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taxe foncière/an (€)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="fiscalite" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="locationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nue">Location nue</SelectItem>
                            <SelectItem value="meublee">Location meublée</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="regimeFiscal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Régime fiscal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="micro">Micro</SelectItem>
                            <SelectItem value="reel">Réel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {locationType === 'meublee' && (
                    <FormField
                      control={form.control}
                      name="statusLoueur"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut du loueur</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lmnp">LMNP (Non Professionnel)</SelectItem>
                              <SelectItem value="lmp">LMP (Professionnel)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            LMP si recettes supérieures à 23k€ ET supérieures à 50% revenus foyer
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="trancheMarginalImposition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Tranche marginale d'imposition (11%, 30%, 41%, 45%)">
                            TMI (%)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dispositif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dispositif de défiscalisation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aucun">Aucun</SelectItem>
                            <SelectItem value="pinel">Pinel</SelectItem>
                            <SelectItem value="denormandie">Denormandie</SelectItem>
                            <SelectItem value="malraux">Malraux</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {(dispositif === 'pinel' || dispositif === 'denormandie') && (
                    <>
                      <FormField
                        control={form.control}
                        name="dureePinel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Durée engagement</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="6">6 ans</SelectItem>
                                <SelectItem value="9">9 ans</SelectItem>
                                <SelectItem value="12">12 ans</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="anneePinel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Année d'investissement</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {dispositif === 'malraux' && (
                    <>
                      <FormField
                        control={form.control}
                        name="montantTravauxMalraux"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant travaux Malraux (€)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>Plafond: 400 000 € sur 4 ans</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zoneMalraux"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zone Malraux</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="secteur_sauvegarde">Secteur sauvegardé (30%)</SelectItem>
                                <SelectItem value="autre">Autre zone (22%)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="projection" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dureeProjection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durée de projection (années)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tauxInflationLoyers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Évolution annuelle des loyers (IRL ~1-2%)">
                            Inflation loyers (%/an)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tauxInflationCharges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inflation charges (%/an)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tauxAppreciationBien"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <InfoTooltip content="Appréciation annuelle du prix du bien immobilier">
                            Appréciation bien (%/an)
                          </InfoTooltip>
                        </FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex flex-col items-center gap-4 pt-6">
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg w-full">
                  <h4 className="font-semibold text-red-800 mb-2">Erreurs de validation :</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {error?.message || 'Erreur inconnue'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <Button type="submit" size="lg" disabled={loading} className="min-w-[200px]">
                {loading ? 'Calcul en cours...' : 'Calculer la rentabilité'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 