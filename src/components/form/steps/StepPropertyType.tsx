'use client';

import React from 'react';
import { useSimulationStore } from '@/store/simulation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Home, MapPin } from 'lucide-react';

const PROPERTY_TYPES = [
  {
    value: 'neuf' as const,
    title: 'Bien Neuf',
    description: 'Appartement ou maison neuf, éligible aux dispositifs Pinel',
    icon: Building,
    benefits: ['Frais de notaire réduits (~2,5%)', 'Garanties constructeur', 'Éligible Pinel'],
    notaryFeesRate: 2.5
  },
  {
    value: 'ancien' as const,
    title: 'Bien Ancien',
    description: 'Appartement ou maison existant, avec possibilité de travaux',
    icon: Home,
    benefits: ['Prix souvent plus attractif', 'Éligible Denormandie/Malraux', 'Négociation possible'],
    notaryFeesRate: 7.5
  },
  {
    value: 'saisonnier' as const,
    title: 'Location Saisonnière',
    description: 'Bien destiné à la location courte durée (Airbnb, etc.)',
    icon: MapPin,
    benefits: ['Rendement potentiellement élevé', 'Flexibilité d\'usage', 'Régime meublé'],
    notaryFeesRate: 7.5
  }
];

export function StepPropertyType() {
  const { data, updateData } = useSimulationStore();

  const handleSelectType = (propertyType: 'neuf' | 'ancien' | 'saisonnier', notaryFeesRate: number) => {
    updateData({ 
      propertyType,
      // Auto-calcul des frais de notaire si un prix est déjà saisi
      ...(data.price && { notaryFees: data.price * (notaryFeesRate / 100) })
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <p className="text-gray-600">
          Sélectionnez le type de bien que vous souhaitez acquérir pour optimiser votre simulation fiscale.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PROPERTY_TYPES.map((type) => {
          const Icon = type.icon;
          const isSelected = data.propertyType === type.value;
          
          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary shadow-lg' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleSelectType(type.value, type.notaryFeesRate)}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Icon className={`w-8 h-8 ${isSelected ? 'text-primary' : 'text-gray-400'}`} />
                  {isSelected && (
                    <Badge variant="default">
                      Sélectionné
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Avantages
                  </p>
                  <ul className="space-y-1">
                    {type.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Indication des frais de notaire */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Frais de notaire : <span className="font-medium">~{type.notaryFeesRate}%</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informations complémentaires si un type est sélectionné */}
      {data.propertyType && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Bon choix ! Voici ce qui vous attend :
              </p>
              {data.propertyType === 'neuf' && (
                <p className="text-sm text-blue-700">
                  Les biens neufs offrent des garanties et sont éligibles aux dispositifs de défiscalisation comme le Pinel. 
                  Les frais de notaire sont réduits mais le prix d'achat est généralement plus élevé.
                </p>
              )}
              {data.propertyType === 'ancien' && (
                <p className="text-sm text-blue-700">
                  L'ancien permet souvent de négocier le prix et d'optimiser le rendement. 
                  Possibilité de bénéficier des dispositifs Denormandie ou Malraux selon la zone et les travaux.
                </p>
              )}
              {data.propertyType === 'saisonnier' && (
                <p className="text-sm text-blue-700">
                  La location saisonnière peut offrir des rendements élevés mais nécessite plus de gestion. 
                  Attention aux nouvelles règles 2025 : plafond micro-BIC à 15k€ si non classé.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 