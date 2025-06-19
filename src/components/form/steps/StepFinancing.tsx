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
import { Calculator, PiggyBank, Percent, Calendar, Shield } from 'lucide-react';

const financingSchema = z.object({
  downPayment: z.number().min(0, 'L\'apport doit être positif'),
  loanAmount: z.number().min(0, 'Le montant du prêt doit être positif'),
  interestRate: z.number().min(0, 'Le taux d\'intérêt doit être positif').max(10, 'Taux trop élevé'),
  loanDuration: z.number().min(1, 'Durée minimum 1 an').max(30, 'Durée maximum 30 ans'),
  insuranceRate: z.number().min(0, 'Le taux d\'assurance doit être positif').max(2, 'Taux d\'assurance trop élevé'),
});

type FinancingForm = z.infer<typeof financingSchema>;

export function StepFinancing() {
  const { data, updateData } = useSimulationStore();

  const form = useForm<FinancingForm>({
    resolver: zodResolver(financingSchema),
    defaultValues: {
      downPayment: data.downPayment || 0,
      loanAmount: data.loanAmount || 0,
      interestRate: data.interestRate || 3.5,
      loanDuration: data.loanDuration || 20,
      insuranceRate: data.insuranceRate || 0.36,
    },
    mode: 'onChange',
  });

  const watchedDownPayment = form.watch('downPayment');
  const watchedLoanAmount = form.watch('loanAmount');
  const watchedInterestRate = form.watch('interestRate');
  const watchedLoanDuration = form.watch('loanDuration');
  const watchedInsuranceRate = form.watch('insuranceRate');

  const totalCost = (data.price || 0) + (data.notaryFees || 0);

  // Auto-calcul du prêt basé sur l'apport
  React.useEffect(() => {
    if (watchedDownPayment !== undefined && totalCost > 0) {
      const calculatedLoanAmount = Math.max(0, totalCost - watchedDownPayment);
      form.setValue('loanAmount', calculatedLoanAmount);
    }
  }, [watchedDownPayment, totalCost, form]);

  // Mise à jour du store en temps réel
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      updateData({
        downPayment: values.downPayment || 0,
        loanAmount: values.loanAmount || 0,
        interestRate: values.interestRate || 0,
        loanDuration: values.loanDuration || 0,
        insuranceRate: values.insuranceRate || 0,
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateData]);

  // Calcul des mensualités
  const calculateMonthlyPayment = () => {
    if (!watchedLoanAmount || !watchedInterestRate || !watchedLoanDuration) return 0;
    
    const monthlyRate = watchedInterestRate / 100 / 12;
    const numberOfPayments = watchedLoanDuration * 12;
    
    if (monthlyRate === 0) return watchedLoanAmount / numberOfPayments;
    
    const monthlyPayment = watchedLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return monthlyPayment;
  };

  const calculateInsurancePayment = () => {
    if (!watchedLoanAmount || !watchedInsuranceRate) return 0;
    return (watchedLoanAmount * watchedInsuranceRate / 100) / 12;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const monthlyInsurance = calculateInsurancePayment();
  const totalMonthlyPayment = monthlyPayment + monthlyInsurance;

  const downPaymentPercentage = totalCost > 0 ? (watchedDownPayment / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-gray-600">
          Configurez votre financement. Le montant du prêt est calculé automatiquement selon votre apport.
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          {/* Résumé des coûts */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Rappel du coût total</h3>
              <div className="text-2xl font-bold text-blue-700">
                {totalCost.toLocaleString('fr-FR')} €
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Prix + frais de notaire
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Apport personnel */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <PiggyBank className="w-4 h-4" />
                      Apport personnel
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Montant de votre apport en cash
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pourcentage d'apport */}
              {totalCost > 0 && (
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between items-center">
                    <span>Pourcentage d'apport :</span>
                    <Badge variant={downPaymentPercentage >= 20 ? 'default' : 'destructive'}>
                      {downPaymentPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  {downPaymentPercentage < 10 && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Apport très faible - négociation plus difficile
                    </p>
                  )}
                  {downPaymentPercentage >= 20 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ Apport confortable pour négocier
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Montant du prêt */}
            <FormField
              control={form.control}
              name="loanAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Montant du prêt
                    <Badge variant="outline" className="text-xs">
                      Auto-calculé
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="200000"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormDescription>
                    Coût total - Apport = {(totalCost - watchedDownPayment).toLocaleString('fr-FR')} €
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Taux d'intérêt */}
            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Taux d'intérêt annuel
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="3.50"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                                             <Slider
                         value={[field.value || 0]}
                         onValueChange={(value: number[]) => field.onChange(value[0])}
                         max={8}
                         min={1}
                         step={0.1}
                         className="w-full"
                       />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Taux nominal annuel (hors assurance)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Durée du prêt */}
            <FormField
              control={form.control}
              name="loanDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Durée du prêt
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="20"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                                             <Slider
                         value={[field.value || 0]}
                         onValueChange={(value: number[]) => field.onChange(value[0])}
                         max={30}
                         min={5}
                         step={1}
                         className="w-full"
                       />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Durée en années (5 à 30 ans)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Assurance emprunteur */}
          <FormField
            control={form.control}
            name="insuranceRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Taux d'assurance emprunteur
                </FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.36"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                    />
                                         <Slider
                       value={[field.value || 0]}
                       onValueChange={(value: number[]) => field.onChange(value[0])}
                       max={1}
                       min={0.1}
                       step={0.01}
                       className="w-full"
                     />
                  </div>
                </FormControl>
                <FormDescription>
                  Taux annuel sur le capital emprunté (généralement 0,25% à 0,50%)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {/* Récapitulatif des mensualités */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Récapitulatif mensuel</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Capital + intérêts :</span>
                <span className="font-medium">{monthlyPayment.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}</span>
              </div>
              <div className="flex justify-between">
                <span>Assurance :</span>
                <span className="font-medium">{monthlyInsurance.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Total mensuel :</span>
                  <span>{totalMonthlyPayment.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}</span>
                </div>
              </div>
              <div className="text-xs text-gray-600">
                Coût total du crédit : {(totalMonthlyPayment * watchedLoanDuration * 12 - watchedLoanAmount).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conseils de financement */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-green-900 mb-2">💡 Conseils de financement</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Un apport de 20% minimum facilite la négociation bancaire</p>
            <p>• L'assurance peut représenter 10-20% du coût total du crédit</p>
            <p>• Durée plus longue = mensualités plus faibles mais coût total plus élevé</p>
            <p>• Négociez le taux : 0,1% d'économie = plusieurs milliers d'euros</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 