import { TableauAmortissement } from '../types/calculator';
import { SimulationInput, YearlyProjection } from '@/schemas/simulation';

/**
 * Calcule la mensualité d'un prêt
 */
export function calculateLoanPayment(
    principal: number,
    annualRate: number,
    years: number
): number {
    if (principal === 0 || years === 0) return 0;

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) return principal / numPayments;

    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);
}

/**
 * Génère le plan d'amortissement d'un prêt
 */
export function generateAmortizationSchedule(
    principal: number,
    annualRate: number,
    years: number
): Array<{
    year: number;
    interestPaid: number;
    principalPaid: number;
    remainingBalance: number;
}> {
    if (principal === 0 || years === 0) return [];

    const monthlyPayment = calculateLoanPayment(principal, annualRate, years);
    const monthlyRate = annualRate / 100 / 12;
    const schedule = [];

    let remainingBalance = principal;

    for (let year = 1; year <= years; year++) {
        let yearInterest = 0;
        let yearPrincipal = 0;

        for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = Math.min(monthlyPayment - interestPayment, remainingBalance);

            yearInterest += interestPayment;
            yearPrincipal += principalPayment;
            remainingBalance -= principalPayment;
        }

        schedule.push({
            year,
            interestPaid: yearInterest,
            principalPaid: yearPrincipal,
            remainingBalance: Math.max(0, remainingBalance)
        });
    }

    return schedule;
}

/**
 * Calcule les rentabilités (brute, nette, nette-nette)
 */
export function calculateYields(
    annualRent: number,
    annualExpenses: number,
    annualTax: number,
    acquisitionCost: number
): {
    gross: number;
    net: number;
    netNet: number;
} {
    const gross = acquisitionCost > 0 ? (annualRent / acquisitionCost) * 100 : 0;
    const net = acquisitionCost > 0 ? ((annualRent - annualExpenses) / acquisitionCost) * 100 : 0;
    const netNet = acquisitionCost > 0 ? ((annualRent - annualExpenses - annualTax) / acquisitionCost) * 100 : 0;

    return { gross, net, netNet };
}

/**
 * Calcule le TRI (Taux de Rendement Interne) par méthode de Newton robuste
 */
export function calculateIRR(cashFlows: number[], guess: number = 0.1): number {
    // Validation des flux de trésorerie
    if (!cashFlows || cashFlows.length < 2) return 0;

    // Vérifier qu'il y a au moins un flux négatif et un positif
    const hasNegative = cashFlows.some(cf => cf < 0);
    const hasPositive = cashFlows.some(cf => cf > 0);
    if (!hasNegative || !hasPositive) return 0;

    const maxIterations = 1000;
    const tolerance = 1e-7;

    // Essayer plusieurs valeurs initiales pour éviter la divergence
    const initialGuesses = [guess, 0.05, 0.15, 0.25, -0.05];

    for (const initialGuess of initialGuesses) {
        let rate = initialGuess;
        let lastRate = rate;

        for (let i = 0; i < maxIterations; i++) {
            let npv = 0;
            let dnpv = 0;

            // Calcul de la VAN et de sa dérivée
            for (let t = 0; t < cashFlows.length; t++) {
                if (rate <= -1) break; // Éviter les taux impossibles

                const factor = Math.pow(1 + rate, t);
                if (factor === 0 || !isFinite(factor)) break;

                npv += cashFlows[t] / factor;
                if (t > 0) {
                    dnpv -= (t * cashFlows[t]) / (factor * (1 + rate));
                }
            }

            // Vérification de convergence
            if (Math.abs(npv) < tolerance) {
                const result = rate * 100;
                // Validation du résultat (TRI entre -99% et 1000%)
                if (result >= -99 && result <= 1000) {
                    return result;
                }
                break;
            }

            // Éviter la division par zéro et les dérivées trop petites
            if (Math.abs(dnpv) < 1e-10) break;

            const newRate = rate - npv / dnpv;

            // Éviter les oscillations et limiter les changements drastiques
            if (Math.abs(newRate - lastRate) < tolerance) {
                const result = newRate * 100;
                if (result >= -99 && result <= 1000) {
                    return result;
                }
                break;
            }

            // Limiter le taux pour éviter la divergence
            lastRate = rate;
            rate = Math.max(-0.99, Math.min(10, newRate));

            // Détection d'oscillation
            if (i > 10 && Math.abs(rate - lastRate) > Math.abs(newRate - rate)) {
                rate = (rate + lastRate) / 2; // Moyenne pour stabiliser
            }
        }
    }

    // Si aucune solution trouvée, retourner 0 (pas de TRI calculable)
    return 0;
}

/**
 * Calcule la valeur future d'un bien avec appréciation
 */
export function calculatePropertyValue(
    initialValue: number,
    years: number,
    appreciationRate: number
): number {
    return initialValue * Math.pow(1 + appreciationRate / 100, years);
}

/**
 * Calcule le cash-flow mensuel net
 */
export function calculateMonthlyCashflow(
    monthlyRent: number,
    monthlyExpenses: number,
    monthlyLoanPayment: number,
    monthlyTax: number = 0
): number {
    return monthlyRent - monthlyExpenses - monthlyLoanPayment - monthlyTax;
}

/**
 * Formatage des montants en euros
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formatage des pourcentages
 */
export function formatPercentage(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value / 100);
}

/**
 * Calcule la mensualité d'un prêt amortissable à mensualités constantes
 * @param capital Capital emprunté
 * @param tauxAnnuel Taux d'intérêt annuel en %
 * @param dureeAnnees Durée en années
 * @returns Mensualité
 */
export function calculerMensualite(capital: number, tauxAnnuel: number, dureeAnnees: number): number {
    if (capital <= 0 || tauxAnnuel <= 0 || dureeAnnees <= 0) return 0;

    const tauxMensuel = tauxAnnuel / 100 / 12;
    const nombreMensualites = dureeAnnees * 12;

    const mensualite = (capital * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -nombreMensualites));

    return mensualite;
}

/**
 * Génère le tableau d'amortissement d'un prêt
 * @param capital Capital emprunté
 * @param tauxAnnuel Taux d'intérêt annuel en %
 * @param dureeAnnees Durée en années
 * @returns Tableau d'amortissement mensuel
 */
export function genererTableauAmortissement(
    capital: number,
    tauxAnnuel: number,
    dureeAnnees: number
): TableauAmortissement[] {
    if (capital <= 0 || tauxAnnuel <= 0 || dureeAnnees <= 0) return [];

    const tauxMensuel = tauxAnnuel / 100 / 12;
    const nombreMensualites = dureeAnnees * 12;
    const mensualite = calculerMensualite(capital, tauxAnnuel, dureeAnnees);

    const tableau: TableauAmortissement[] = [];
    let capitalRestant = capital;

    for (let i = 1; i <= nombreMensualites; i++) {
        const interets = capitalRestant * tauxMensuel;
        const capitalPeriode = mensualite - interets;
        capitalRestant -= capitalPeriode;

        // S'assurer que le capital restant ne devient pas négatif
        if (capitalRestant < 0) capitalRestant = 0;

        tableau.push({
            periode: i,
            mensualite,
            interets,
            capital: capitalPeriode,
            capitalRestant
        });
    }

    return tableau;
}

/**
 * Calcule les intérêts payés sur une année donnée
 * @param tableauAmortissement Tableau d'amortissement mensuel
 * @param annee Année (1-based)
 * @returns Intérêts payés dans l'année
 */
export function calculerInteretsAnnuels(tableauAmortissement: TableauAmortissement[], annee: number): number {
    const debutPeriode = (annee - 1) * 12 + 1;
    const finPeriode = annee * 12;

    return tableauAmortissement
        .filter(ligne => ligne.periode >= debutPeriode && ligne.periode <= finPeriode)
        .reduce((total, ligne) => total + ligne.interets, 0);
}

/**
 * Calcule le capital remboursé sur une année donnée
 * @param tableauAmortissement Tableau d'amortissement mensuel
 * @param annee Année (1-based)
 * @returns Capital remboursé dans l'année
 */
export function calculerCapitalRembourseAnnuel(tableauAmortissement: TableauAmortissement[], annee: number): number {
    const debutPeriode = (annee - 1) * 12 + 1;
    const finPeriode = annee * 12;

    return tableauAmortissement
        .filter(ligne => ligne.periode >= debutPeriode && ligne.periode <= finPeriode)
        .reduce((total, ligne) => total + ligne.capital, 0);
}

/**
 * Calcule le capital restant dû en fin d'année
 * @param tableauAmortissement Tableau d'amortissement mensuel
 * @param annee Année (1-based)
 * @returns Capital restant dû en fin d'année
 */
export function calculerCapitalRestantAnnuel(tableauAmortissement: TableauAmortissement[], annee: number): number {
    const finPeriode = annee * 12;
    const ligne = tableauAmortissement.find(l => l.periode === finPeriode);
    return ligne ? ligne.capitalRestant : 0;
}

/**
 * Calcule l'abattement pour durée de détention sur les plus-values immobilières
 * @param anneesDetention Nombre d'années de détention
 * @returns Object avec abattements IR et PS en %
 */
export function calculerAbattementPlusValue(anneesDetention: number): { abattementIR: number; abattementPS: number } {
    let abattementIR = 0;
    let abattementPS = 0;

    if (anneesDetention >= 22) {
        abattementIR = 100; // Exonération totale IR après 22 ans
    } else if (anneesDetention >= 6) {
        // 6% par an de la 6e à la 21e année, puis 4% la 22e année
        const anneesAbattement = Math.min(anneesDetention - 5, 17);
        abattementIR = anneesAbattement * 6;
        if (anneesDetention === 22) abattementIR += 4;
    }

    if (anneesDetention >= 30) {
        abattementPS = 100; // Exonération totale PS après 30 ans
    } else if (anneesDetention >= 6) {
        // 1.65% par an de la 6e à la 21e année, puis 1.60% de la 22e à la 29e année
        const anneesAbattement6a21 = Math.min(anneesDetention - 5, 17);
        abattementPS = anneesAbattement6a21 * 1.65;

        if (anneesDetention >= 22) {
            const anneesAbattement22a29 = Math.min(anneesDetention - 21, 8);
            abattementPS += anneesAbattement22a29 * 1.6;
        }
    }

    return {
        abattementIR: Math.min(abattementIR, 100),
        abattementPS: Math.min(abattementPS, 100)
    };
}

/**
 * Fonction de diagnostic pour les calculs de TRI
 */
export function debugIRR(cashFlows: number[]): {
    flows: number[];
    hasNegative: boolean;
    hasPositive: boolean;
    isValid: boolean;
    npvAt0: number;
    npvAt10: number;
    suggestion: string;
} {
    const hasNegative = cashFlows.some(cf => cf < 0);
    const hasPositive = cashFlows.some(cf => cf > 0);
    const isValid = hasNegative && hasPositive && cashFlows.length >= 2;

    // Calcul NPV à différents taux pour diagnostic
    const npvAt0 = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1, t), 0);
    const npvAt10 = cashFlows.reduce((sum, cf, t) => sum + cf / Math.pow(1.1, t), 0);

    let suggestion = "";
    if (!hasNegative) suggestion = "Aucun flux négatif - impossible de calculer un TRI";
    else if (!hasPositive) suggestion = "Aucun flux positif - investissement non rentable";
    else if (cashFlows.length < 2) suggestion = "Pas assez de flux pour calculer un TRI";
    else if (Math.abs(npvAt0) < 1) suggestion = "Flux très faibles - TRI peu significatif";
    else suggestion = "Flux valides pour calcul TRI";

    return {
        flows: [...cashFlows],
        hasNegative,
        hasPositive,
        isValid,
        npvAt0,
        npvAt10,
        suggestion
    };
} 