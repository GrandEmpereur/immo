'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulation';
import { useResultsStore } from '@/store/results';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import des étapes
import { StepPropertyType } from './steps/StepPropertyType';
import { StepPurchaseDetails } from './steps/StepPurchaseDetails';
import { StepFinancing } from './steps/StepFinancing';
import { StepRentAndCharges } from './steps/StepRentAndCharges';
import { StepTaxRegime } from './steps/StepTaxRegime';
import { StepSummary } from './steps/StepSummary';

const STEPS = [
  { id: 1, title: "Type de bien", component: StepPropertyType },
  { id: 2, title: "Détails d'achat", component: StepPurchaseDetails },
  { id: 3, title: "Financement", component: StepFinancing },
  { id: 4, title: "Loyers et charges", component: StepRentAndCharges },
  { id: 5, title: "Régime fiscal", component: StepTaxRegime },
  { id: 6, title: "Récapitulatif", component: StepSummary },
];

export function SimulationFormWizard() {
  const { currentStep, nextStep, prevStep, resetSimulation, data } = useSimulationStore();
  const { setCalculating, setResults, setError } = useResultsStore();

  const currentStepData = STEPS.find(step => step.id === currentStep);
  const progress = (currentStep / STEPS.length) * 100;
  
  const handleNext = () => {
    nextStep();
  };

  const handlePrevious = () => {
    prevStep();
  };

  const handleCalculate = async () => {
    try {
      setCalculating(true);
      
      // Import dynamique du moteur de calcul pour éviter le chargement initial
      const { simulateInvestment } = await import('@/lib/calculations/calculator');
      const { simulationSchema } = await import('@/schemas/simulation');
      
      // Validation finale des données
      const validationResult = simulationSchema.safeParse(data);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => e.message).join(', ');
        setError(`Erreurs de validation : ${errors}`);
        return;
      }

      // Calcul de la simulation
      const results = simulateInvestment(validationResult.data);
      setResults(results);
      
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir recommencer ? Toutes les données seront perdues.')) {
      resetSimulation();
    }
  };

  const canGoNext = currentStep < STEPS.length;
  const canGoPrevious = currentStep > 1;
  const isLastStep = currentStep === STEPS.length;

  if (!currentStepData) {
    return <div>Étape introuvable</div>;
  }

  const StepComponent = currentStepData.component;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête avec progression */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Simulateur de Rentabilité Immobilière
          </h1>
          <Button variant="outline" onClick={handleReset}>
            Recommencer
          </Button>
        </div>
        
        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Étape {currentStep} sur {STEPS.length}</span>
            <span>{Math.round(progress)}% complété</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Indicateurs d'étapes */}
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center space-y-2 ${
                step.id === currentStep ? 'text-primary' : 
                step.id < currentStep ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.id}
              </div>
              <span className="text-xs text-center max-w-20">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <Card>
        <CardHeader>
          <CardTitle>{currentStepData.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <StepComponent />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Précédent
        </Button>

        <div className="flex gap-2">
          {isLastStep ? (
            <Button
              onClick={handleCalculate}
              className="flex items-center gap-2"
              size="lg"
            >
              Calculer la rentabilité
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canGoNext}
              className="flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 