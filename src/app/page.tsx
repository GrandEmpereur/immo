'use client';

import React, { useState } from 'react';
import { SimulationFormWizard } from '@/components/form/SimulationFormWizard';
import { useResultsStore } from '@/store/results';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { exportToPDF, exportToExcel } from '@/lib/exports';
import { 
  Calculator, 
  Home as HomeIcon, 
  TrendingUp, 
  Info, 
  AlertTriangle,
  BarChart3,
  PieChart,
  FileDown,
  FileSpreadsheet,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Euro,
  Calendar,
  TrendingDown
} from 'lucide-react';

export default function Home() {
  const { results, error, isCalculating } = useResultsStore();
  const [showDetails, setShowDetails] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <HomeIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Calculateur Immobilier Pro
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analysez la rentabilité de vos investissements immobiliers avec précision. 
            Tous les régimes fiscaux français, dispositifs de défiscalisation et projections temporelles inclus.
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculs professionnels
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              TRI & ROI précis
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Fiscalité 2025
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Projections 30 ans
            </Badge>
          </div>
        </div>

        {/* Erreurs globales */}
        {error && (
          <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur de calcul</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
              </Alert>
        )}

        {/* Contenu principal */}
        {!results ? (
          // Formulaire wizard
          <SimulationFormWizard />
        ) : (
          // Résultats de simulation
          <div className="space-y-8">
            {/* En-tête des résultats */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <TrendingUp className="w-6 h-6" />
                  Résultats de simulation
                  </CardTitle>
                <CardDescription className="text-green-700">
                  Analyse complète de la rentabilité de votre investissement immobilier
                </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {results.yieldGross.toFixed(2)}%
                    </div>
                    <div className="text-sm text-green-600">Rentabilité brute</div>
                      </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {results.yieldNetNet.toFixed(2)}%
                    </div>
                    <div className="text-sm text-blue-600">Rendement net-net</div>
                      </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">
                      {results.irr.year10.toFixed(2)}%
                    </div>
                    <div className="text-sm text-purple-600">TRI 10 ans</div>
                      </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${results.avgCashflowMonthly >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {results.avgCashflowMonthly >= 0 ? '+' : ''}{Math.round(results.avgCashflowMonthly)} €
                    </div>
                    <div className="text-sm text-gray-600">Cash-flow moyen/mois</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <div className="flex justify-center gap-4 flex-wrap">
              <Button 
                variant={showDetails ? "default" : "outline"} 
                className="flex items-center gap-2"
                onClick={() => setShowDetails(!showDetails)}
              >
                <PieChart className="w-4 h-4" />
                {showDetails ? 'Masquer détails' : 'Voir détails'}
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button 
                variant={showCharts ? "default" : "outline"} 
                className="flex items-center gap-2"
                onClick={() => setShowCharts(!showCharts)}
              >
                <BarChart3 className="w-4 h-4" />
                {showCharts ? 'Masquer graphiques' : 'Voir graphiques'}
                {showCharts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => exportToPDF(results)}
              >
                <FileDown className="w-4 h-4" />
                Exporter PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => exportToExcel(results)}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exporter Excel
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="w-4 h-4" />
                Nouvelle simulation
              </Button>
            </div>

            {/* Résumé des hypothèses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Hypothèses de simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type de bien :</span>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {results.assumptions.propertyType === 'neuf' ? 'Neuf' : 
                         results.assumptions.propertyType === 'ancien' ? 'Ancien' : 'Saisonnier'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Régime fiscal :</span>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {results.assumptions.regime}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Prix d'achat :</span>
                    <div className="mt-1 font-semibold">
                      {results.assumptions.price.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Loyer mensuel :</span>
                    <div className="mt-1 font-semibold">
                      {results.assumptions.rentMonthly.toLocaleString('fr-FR')} €
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Indicateurs de performance détaillés */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rentabilité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Rentabilité brute :</span>
                    <span className="font-semibold">{results.yieldGross.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rentabilité nette :</span>
                    <span className="font-semibold">{results.yieldNet.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rentabilité net-net :</span>
                    <span className="font-semibold">{results.yieldNetNet.toFixed(2)}%</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>ROI total :</span>
                    <span className="font-bold text-primary">{results.roi.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>TRI par horizon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>TRI 10 ans :</span>
                    <span className="font-semibold">{results.irr.year10.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRI 20 ans :</span>
                    <span className="font-semibold">{results.irr.year20.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TRI 30 ans :</span>
                    <span className="font-semibold">{results.irr.year30.toFixed(2)}%</span>
                  </div>
                  <Separator />
                  {results.paybackYear && (
                    <div className="flex justify-between">
                      <span>Retour sur investissement :</span>
                      <span className="font-bold text-primary">{results.paybackYear} ans</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Informations sur les charges et fiscalité */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cash-flows</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Cash-flow mensuel moyen :</span>
                    <span className={`font-semibold ${results.avgCashflowMonthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {results.avgCashflowMonthly >= 0 ? '+' : ''}{results.avgCashflowMonthly.toFixed(0)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Investissement total :</span>
                    <span className="font-semibold">{results.totalInvestment.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit total projeté :</span>
                    <span className="font-semibold text-green-600">
                      +{results.totalProfit.toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fiscalité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total impôts payés :</span>
                    <span className="font-semibold text-red-600">
                      -{results.totalTaxPaid.toLocaleString('fr-FR')} €
                    </span>
              </div>
                  <div className="flex justify-between">
                    <span>Taux d'imposition moyen :</span>
                    <span className="font-semibold">
                      {results.totalTaxPaid > 0 && results.totalProfit > 0 
                        ? ((results.totalTaxPaid / (results.totalProfit + results.totalTaxPaid)) * 100).toFixed(1)
                        : 0
                      }%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section détails détaillés */}
            {showDetails && (
              <Collapsible open={showDetails}>
                <CollapsibleContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="w-5 h-5" />
                        Détails année par année
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="cashflow" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="cashflow">Cash-flows</TabsTrigger>
                          <TabsTrigger value="fiscal">Fiscalité</TabsTrigger>
                          <TabsTrigger value="patrimoine">Patrimoine</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="cashflow" className="mt-6">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Année</TableHead>
                                  <TableHead>Loyers bruts</TableHead>
                                  <TableHead>Loyers effectifs</TableHead>
                                  <TableHead>Charges</TableHead>
                                  <TableHead>Intérêts</TableHead>
                                  <TableHead>Cash-flow</TableHead>
                                  <TableHead>Cumul</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {results.yearlyProjections.slice(0, 10).map((year) => (
                                  <TableRow key={year.year}>
                                    <TableCell className="font-medium">Année {year.year}</TableCell>
                                    <TableCell>{year.rentGross.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell>{year.rentEffective.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-red-600">-{(year.expenses - year.interestPaid).toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-red-600">-{year.interestPaid.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className={year.cashflow >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                      {year.cashflow >= 0 ? '+' : ''}{year.cashflow.toLocaleString('fr-FR')} €
                                    </TableCell>
                                    <TableCell className={year.cumulatedCashflow >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                      {year.cumulatedCashflow >= 0 ? '+' : ''}{year.cumulatedCashflow.toLocaleString('fr-FR')} €
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          {results.yearlyProjections.length > 10 && (
                            <p className="text-sm text-gray-500 mt-4 text-center">
                              Affichage des 10 premières années • {results.yearlyProjections.length} années calculées au total
                            </p>
                          )}
                        </TabsContent>

                        <TabsContent value="fiscal" className="mt-6">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Année</TableHead>
                                  <TableHead>Revenus imposables</TableHead>
                                  <TableHead>Impôt IR</TableHead>
                                  <TableHead>Prélèvements sociaux</TableHead>
                                  <TableHead>Total impôts</TableHead>
                                  <TableHead>Amortissement</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {results.yearlyProjections.slice(0, 10).map((year) => (
                                  <TableRow key={year.year}>
                                    <TableCell className="font-medium">Année {year.year}</TableCell>
                                    <TableCell>{year.taxableIncome.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-red-600">-{year.incomeTax.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-red-600">-{year.socialTax.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-red-600 font-semibold">-{(year.incomeTax + year.socialTax).toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-blue-600">{(year.amortization || 0).toLocaleString('fr-FR')} €</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>

                        <TabsContent value="patrimoine" className="mt-6">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Année</TableHead>
                                  <TableHead>Valeur du bien</TableHead>
                                  <TableHead>Capital restant dû</TableHead>
                                  <TableHead>Fonds propres</TableHead>
                                  <TableHead>Plus-value latente</TableHead>
                                  <TableHead>Capital remboursé</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {results.yearlyProjections.slice(0, 10).map((year) => (
                                  <TableRow key={year.year}>
                                    <TableCell className="font-medium">Année {year.year}</TableCell>
                                    <TableCell className="font-semibold">{year.propertyValue.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-red-600">{year.loanRemaining.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-green-600 font-semibold">
                                      {(year.propertyValue - year.loanRemaining).toLocaleString('fr-FR')} €
                                    </TableCell>
                                    <TableCell className="text-blue-600">+{year.potentialCapitalGain.toLocaleString('fr-FR')} €</TableCell>
                                    <TableCell className="text-green-600">{year.principalPaid.toLocaleString('fr-FR')} €</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Section graphiques */}
            {showCharts && (
              <Collapsible open={showCharts}>
                <CollapsibleContent>
          <Card>
            <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Graphiques et tendances
                      </CardTitle>
            </CardHeader>
            <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Évolution du cash-flow */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Évolution du cash-flow annuel
                          </h3>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-500">
                                Graphique cash-flow année par année
                              </p>
                              <p className="text-xs text-gray-400">
                                (Intégration Recharts prévue)
                              </p>
                            </div>
                          </div>
                </div>
                
                        {/* Évolution du patrimoine */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            Évolution du patrimoine net
                          </h3>
                          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <PieChart className="w-12 h-12 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-500">
                                Valeur bien vs Capital restant dû
                              </p>
                              <p className="text-xs text-gray-400">
                                (Intégration Recharts prévue)
                              </p>
                            </div>
                          </div>
                </div>
                
                        {/* Répartition des flux */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Euro className="w-4 h-4 text-purple-600" />
                            Répartition des flux (Année 1)
                          </h3>
                          <div className="space-y-3">
                            {results.yearlyProjections[0] && (
                              <>
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                  <span className="text-green-700">Revenus locatifs</span>
                                  <span className="font-semibold text-green-700">
                                    +{results.yearlyProjections[0].rentEffective.toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                                  <span className="text-red-700">Charges et intérêts</span>
                                  <span className="font-semibold text-red-700">
                                    -{results.yearlyProjections[0].expenses.toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                                  <span className="text-orange-700">Impôts</span>
                                  <span className="font-semibold text-orange-700">
                                    -{(results.yearlyProjections[0].incomeTax + results.yearlyProjections[0].socialTax).toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                  <span className="text-blue-700 font-semibold">Cash-flow net</span>
                                  <span className={`font-bold ${results.yearlyProjections[0].cashflow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {results.yearlyProjections[0].cashflow >= 0 ? '+' : ''}{results.yearlyProjections[0].cashflow.toLocaleString('fr-FR')} €
                                  </span>
                                </div>
                              </>
                            )}
                </div>
              </div>
              
                        {/* Indicateurs de performance */}
                        <div className="space-y-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-indigo-600" />
                            Indicateurs clés
                          </h3>
                          <div className="space-y-3">
                            <div className="p-3 border rounded-lg">
                              <div className="text-sm text-gray-600">Rentabilité brute</div>
                              <div className="text-2xl font-bold text-green-600">{results.yieldGross.toFixed(2)}%</div>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <div className="text-sm text-gray-600">TRI 10 ans</div>
                              <div className="text-2xl font-bold text-blue-600">{results.irr.year10.toFixed(2)}%</div>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <div className="text-sm text-gray-600">ROI total</div>
                              <div className="text-2xl font-bold text-purple-600">{results.roi.toFixed(1)}%</div>
                            </div>
                            {results.paybackYear && (
                              <div className="p-3 border rounded-lg">
                                <div className="text-sm text-gray-600">Retour sur investissement</div>
                                <div className="text-2xl font-bold text-indigo-600">{results.paybackYear} ans</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Note sur les projections */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      À propos de ces projections
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Ces calculs sont basés sur les données que vous avez fournies et la législation fiscale 2025. 
                      Les résultats sont à titre indicatif et ne constituent pas un conseil en investissement. 
                      Les performances passées ne préjugent pas des performances futures.
                    </p>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
