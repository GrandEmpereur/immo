'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { IndicateursRentabilite } from '@/lib/types/calculator';

interface Props {
  resultats: IndicateursRentabilite;
  investissementInitial: number;
  loyerMensuel: number;
}

export function ResultatsRentabilite({ resultats, investissementInitial, loyerMensuel }: Props) {
  const formatEuro = (montant: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  
  const formatPourcentage = (valeur: number) => 
    `${valeur.toFixed(2)}%`;

  // Couleurs pour les graphiques
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  // Données pour le graphique de cash-flow cumulé
  const donneesCashFlow = resultats.resultatProjection.map(annee => ({
    annee: annee.annee,
    cashFlowCumule: Math.round(annee.cashFlowCumule),
    cashFlowAnnuel: Math.round(annee.cashFlowApresImpot),
    valeurBien: Math.round(annee.valeurBien),
  }));

  // Données pour le graphique de rentabilité
  const donneesRentabilite = [
    { nom: 'Rentabilité Brute', valeur: resultats.rentabiliteBrute },
    { nom: 'Rentabilité Nette', valeur: resultats.rentabiliteNette },
    { nom: 'Rentabilité Nette-Nette', valeur: resultats.rentabiliteNetteNette },
  ];

  // Répartition des coûts première année
  const premiereAnnee = resultats.resultatProjection[0];
  const donneesRepartition = [
    { nom: 'Charges', valeur: premiereAnnee.chargesAnnuelles, couleur: COLORS[0] },
    { nom: 'Intérêts', valeur: premiereAnnee.interetsPayes, couleur: COLORS[1] },
    { nom: 'Impôts', valeur: premiereAnnee.impotIR + premiereAnnee.prelevementsSociaux, couleur: COLORS[2] },
    { nom: 'Capital remboursé', valeur: premiereAnnee.capitalRembourse, couleur: COLORS[3] },
  ].filter(item => item.valeur > 0);

  // Évaluation globale
  const evaluationGlobale = () => {
    if (resultats.tri >= 8) return { status: 'excellent', couleur: 'bg-green-500', texte: 'Excellent' };
    if (resultats.tri >= 5) return { status: 'bon', couleur: 'bg-blue-500', texte: 'Bon' };
    if (resultats.tri >= 3) return { status: 'moyen', couleur: 'bg-yellow-500', texte: 'Moyen' };
    return { status: 'faible', couleur: 'bg-red-500', texte: 'Faible' };
  };

  const evaluation = evaluationGlobale();

  return (
    <div className="space-y-6">
      {/* Synthèse globale */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6" />
            Synthèse de l'investissement
          </CardTitle>
          <CardDescription>
            Évaluation globale de la rentabilité de votre projet immobilier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatPourcentage(resultats.tri)}
              </div>
              <div className="text-sm text-blue-600">TRI (Taux de Rendement Interne)</div>
              <Badge className={`mt-2 ${evaluation.couleur} text-white`}>
                {evaluation.texte}
              </Badge>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatEuro(resultats.cashFlowMensuel)}
              </div>
              <div className="text-sm text-green-600">Cash-flow mensuel</div>
              {resultats.cashFlowMensuel > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600 mx-auto mt-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mx-auto mt-2" />
              )}
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatPourcentage(resultats.rentabiliteNetteNette)}
              </div>
              <div className="text-sm text-purple-600">Rentabilité nette-nette</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatPourcentage(resultats.roi)}
              </div>
              <div className="text-sm text-orange-600">ROI total</div>
            </div>
          </div>

          {/* Barre de progression TRI */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Performance TRI</span>
              <span>{formatPourcentage(resultats.tri)}</span>
            </div>
            <Progress value={Math.min(resultats.tri * 10, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0%</span>
              <span>5%</span>
              <span>10%+</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails des indicateurs */}
      <Tabs defaultValue="indicateurs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indicateurs">Indicateurs</TabsTrigger>
          <TabsTrigger value="cashflow">Cash-flow</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
          <TabsTrigger value="fiscalite">Fiscalité</TabsTrigger>
        </TabsList>

        <TabsContent value="indicateurs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique rentabilités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Comparaison des rentabilités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donneesRentabilite}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nom" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatPourcentage(Number(value)), '']} />
                    <Bar dataKey="valeur" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Répartition des coûts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Répartition des coûts (1ère année)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={donneesRepartition}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="valeur"
                      label={({ nom, valeur }) => `${nom}: ${formatEuro(valeur)}`}
                    >
                      {donneesRepartition.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.couleur} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatEuro(Number(value)), '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des indicateurs détaillés */}
          <Card>
            <CardHeader>
              <CardTitle>Indicateurs détaillés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Rentabilités</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rentabilité brute:</span>
                      <span className="font-medium">{formatPourcentage(resultats.rentabiliteBrute)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rentabilité nette:</span>
                      <span className="font-medium">{formatPourcentage(resultats.rentabiliteNette)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rentabilité nette-nette:</span>
                      <span className="font-medium">{formatPourcentage(resultats.rentabiliteNetteNette)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>TRI:</span>
                      <span className="font-medium">{formatPourcentage(resultats.tri)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI total:</span>
                      <span className="font-medium">{formatPourcentage(resultats.roi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gain total:</span>
                      <span className="font-medium">{formatEuro(resultats.gainTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Évolution du cash-flow
              </CardTitle>
              <CardDescription>
                Cash-flow annuel et cumulé sur la durée de l'investissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={donneesCashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="annee" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatEuro(Number(value)), '']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cashFlowAnnuel" 
                    stroke="#8884d8" 
                    name="Cash-flow annuel"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cashFlowCumule" 
                    stroke="#82ca9d" 
                    name="Cash-flow cumulé"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cash-flow mensuel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${resultats.cashFlowMensuel >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatEuro(resultats.cashFlowMensuel)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {resultats.cashFlowMensuel >= 0 ? (
                      <>
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        Investissement auto-financé
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 inline mr-1" />
                        Effort d'épargne requis
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Couverture du prêt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {((loyerMensuel / (premiereAnnee.interetsPayes / 12 + premiereAnnee.capitalRembourse / 12)) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Loyer vs mensualité
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projection pluriannuelle</CardTitle>
              <CardDescription>
                Détail année par année des flux de l'investissement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Année</TableHead>
                      <TableHead>Loyers nets</TableHead>
                      <TableHead>Charges</TableHead>
                      <TableHead>Intérêts</TableHead>
                      <TableHead>Impôts</TableHead>
                      <TableHead>Cash-flow</TableHead>
                      <TableHead>Valeur bien</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultats.resultatProjection.slice(0, 10).map((annee) => (
                      <TableRow key={annee.annee}>
                        <TableCell>{annee.annee}</TableCell>
                        <TableCell>{formatEuro(annee.loyersNets)}</TableCell>
                        <TableCell>{formatEuro(annee.chargesAnnuelles)}</TableCell>
                        <TableCell>{formatEuro(annee.interetsPayes)}</TableCell>
                        <TableCell>{formatEuro(annee.impotIR + annee.prelevementsSociaux)}</TableCell>
                        <TableCell className={annee.cashFlowApresImpot >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatEuro(annee.cashFlowApresImpot)}
                        </TableCell>
                        <TableCell>{formatEuro(annee.valeurBien)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {resultats.resultatProjection.length > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Affichage des 10 premières années. Total: {resultats.resultatProjection.length} années.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plus-value à la revente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {formatEuro(resultats.prixRevente)}
                  </div>
                  <div className="text-sm text-blue-600">Prix de revente estimé</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {formatEuro(resultats.plusValueBrute)}
                  </div>
                  <div className="text-sm text-green-600">Plus-value brute</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {formatEuro(resultats.plusValueNette)}
                  </div>
                  <div className="text-sm text-purple-600">Plus-value nette</div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Détail de la fiscalité</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Impôt sur plus-value:</span>
                    <span>{formatEuro(resultats.impotPlusValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Abattements appliqués:</span>
                    <span>Selon durée de détention</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fiscalite" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Impôts et charges fiscales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total impôts sur loyers:</span>
                    <span className="font-medium">{formatEuro(resultats.totalImpots)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total réductions d'impôt:</span>
                    <span className="font-medium text-green-600">{formatEuro(resultats.totalReductions)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Impact fiscal net:</span>
                    <span className="font-semibold">{formatEuro(resultats.totalImpots - resultats.totalReductions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution de la valeur</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={donneesCashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="annee" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatEuro(Number(value)), '']} />
                    <Line 
                      type="monotone" 
                      dataKey="valeurBien" 
                      stroke="#ff7300" 
                      name="Valeur du bien"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 