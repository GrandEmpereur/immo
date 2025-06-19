'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulation';
import { useResultsStore } from '@/store/results';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Euro, 
  Home, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Calculator
} from 'lucide-react';

const REGIME_LABELS: Record<string, string> = {
  'micro-foncier': 'Micro-foncier',
  'réel-foncier': 'Réel foncier',
  'micro-BIC': 'Micro-BIC',
  'réel-BIC': 'Réel BIC',
  'LMNP-réel': 'LMNP réel',
  'LMP-réel': 'LMP réel',
  'Pinel': 'Dispositif Pinel',
  'Denormandie': 'Dispositif Denormandie',
  'Malraux': 'Dispositif Malraux',
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'neuf': 'Bien neuf',
  'ancien': 'Bien ancien',
  'saisonnier': 'Location saisonnière',
};

export function StepSummary() {
  const { data } = useSimulationStore();
  const { isCalculating, results, error } = useResultsStore();

  // Calculs simples pour l'affichage
  const totalCost = (data.price || 0) + (data.notaryFees || 0);
  const annualRent = (data.rentMonthly || 0) * 12;
  const grossYield = totalCost > 0 ? (annualRent / totalCost) * 100 : 0;
  const monthlyPayment = data.loanAmount && data.interestRate && data.loanDuration 
    ? (() => {
        const monthlyRate = data.interestRate / 100 / 12;
        const numberOfPayments = data.loanDuration * 12;
        if (monthlyRate === 0) return data.loanAmount / numberOfPayments;
        return data.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      })()
    : 0;

  // Calcul du total des charges non récupérables
  const totalNonRecoverableCharges = (data.propertyTaxMonthly || 0) + 
    (data.condoFeesMonthly || 0) + (data.managementFeesMonthly || 0) + 
    (data.insuranceMonthly || 0) + (data.otherExpensesMonthly || 0);
  
  const monthlyCashflow = (data.rentMonthly || 0) - monthlyPayment - totalNonRecoverableCharges;

  // Validation des données
  const getValidationIssues = () => {
    const issues: string[] = [];
    
    if (!data.propertyType) issues.push('Type de bien non sélectionné');
    if (!data.price || data.price < 10000) issues.push('Prix d\'acquisition manquant ou trop faible');
    if (!data.surface || data.surface < 1) issues.push('Surface manquante');
    if (!data.rentMonthly || data.rentMonthly < 100) issues.push('Loyer mensuel manquant ou trop faible');
    if (!data.regime) issues.push('Régime fiscal non sélectionné');
    if (data.loanAmount && data.loanAmount > 0 && (!data.interestRate || data.interestRate <= 0)) {
      issues.push('Taux d\'intérêt manquant pour le prêt');
    }
    
    // Validations spécifiques aux régimes
    if (data.regime === 'micro-foncier' && annualRent > 15000) {
      issues.push('Revenus trop élevés pour le micro-foncier (max 15 000€)');
    }
    if (data.regime === 'micro-BIC' && annualRent > 77700) {
      issues.push('Revenus trop élevés pour le micro-BIC');
    }
    if (data.regime === 'Pinel' && data.propertyType !== 'neuf') {
      issues.push('Le dispositif Pinel ne s\'applique qu\'aux biens neufs');
    }
    
    return issues;
  };

  const validationIssues = getValidationIssues();
  const canCalculate = validationIssues.length === 0;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Récapitulatif de votre simulation</h2>
        <p className="text-gray-600">
          Vérifiez vos paramètres avant de lancer le calcul de rentabilité détaillé.
        </p>
      </div>

      {/* Validation et erreurs */}
      {validationIssues.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Données manquantes ou incohérentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {validationIssues.map((issue, index) => (
                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-600 rounded-full" />
                  {issue}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Récapitulatif du bien */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Caractéristiques du bien
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type de bien :</span>
                <Badge variant="outline">
                  {PROPERTY_TYPE_LABELS[data.propertyType || 'neuf']}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix d'achat :</span>
                <span className="font-semibold">{(data.price || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Frais de notaire :</span>
                <span className="font-semibold">{(data.notaryFees || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Surface :</span>
                <span className="font-semibold">{data.surface || 0} m²</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coût total :</span>
                <span className="font-bold text-lg text-primary">{totalCost.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prix au m² :</span>
                <span className="font-semibold">
                  {data.surface && data.surface > 0 ? Math.round((data.price || 0) / data.surface).toLocaleString('fr-FR') : 0} €/m²
                </span>
              </div>
              {data.dpeClass && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Classe DPE :</span>
                  <Badge variant={['F', 'G'].includes(data.dpeClass) ? 'destructive' : 'default'}>
                    {data.dpeClass}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5" />
            Financement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Apport personnel :</span>
                <span className="font-semibold text-green-600">{(data.downPayment || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Montant emprunté :</span>
                <span className="font-semibold">{(data.loanAmount || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux d'intérêt :</span>
                <span className="font-semibold">{(data.interestRate || 0).toFixed(2)}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Durée du prêt :</span>
                <span className="font-semibold">{data.loanDuration || 0} ans</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mensualité (C+I) :</span>
                <span className="font-bold text-red-600">{monthlyPayment.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">% apport :</span>
                <Badge variant={totalCost > 0 && (data.downPayment || 0) / totalCost >= 0.2 ? 'default' : 'destructive'}>
                  {totalCost > 0 ? ((data.downPayment || 0) / totalCost * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenus et charges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Revenus et charges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Loyer mensuel :</span>
                <span className="font-semibold text-green-600">{(data.rentMonthly || 0).toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Loyer annuel :</span>
                <span className="font-semibold">{annualRent.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Charges non récupérables :</span>
                <span className="font-semibold text-red-600">{(totalNonRecoverableCharges || 0).toLocaleString('fr-FR')} €/mois</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux de vacance :</span>
                <span className="font-semibold">{(data.vacancyRate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rentabilité brute :</span>
                <Badge variant={grossYield >= 6 ? 'default' : grossYield >= 4 ? 'secondary' : 'destructive'}>
                  {grossYield.toFixed(2)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Cash-flow mensuel estimé :</span>
                <span className={`font-bold ${monthlyCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyCashflow >= 0 ? '+' : ''}{monthlyCashflow.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Régime fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Régime fiscal et revente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Régime fiscal :</span>
                <Badge variant="outline">
                  {REGIME_LABELS[data.regime || 'micro-foncier']}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">TMI :</span>
                <span className="font-semibold">{(data.taxpayerTMI || 0)}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Horizon de revente :</span>
                <span className="font-semibold">
                  {data.resaleYear === 0 ? 'Pas de revente' : `${data.resaleYear} ans`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Appréciation annuelle :</span>
                <span className="font-semibold">{(data.appreciationRate || 0).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs rapides */}
      {canCalculate && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              Simulation prête
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-700">
                  {grossYield.toFixed(2)}%
                </div>
                <div className="text-sm text-green-600">Rentabilité brute</div>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${monthlyCashflow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {monthlyCashflow >= 0 ? '+' : ''}{Math.round(monthlyCashflow)} €
                </div>
                <div className="text-sm text-green-600">Cash-flow mensuel</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-700">
                  {data.surface && data.rentMonthly ? (data.rentMonthly / data.surface).toFixed(2) : '0'} €
                </div>
                <div className="text-sm text-green-600">Loyer au m²</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <p className="text-sm text-green-700 text-center">
              Tous les paramètres sont renseignés. Vous pouvez maintenant lancer le calcul détaillé 
              pour obtenir les projections complètes, TRI, ROI et optimisations fiscales.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Conseils avant calcul */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils avant le calcul final</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Vérifiez que tous les montants correspondent à votre situation réelle</p>
            <p>• Les simulations fiscales tiennent compte de la législation 2025</p>
            <p>• Les projections incluent l'évolution des taux, de l'inflation et des plus-values</p>
            <p>• N'hésitez pas à modifier les paramètres pour tester différents scénarios</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 