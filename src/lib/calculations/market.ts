/**
 * Fonctions relatives au marché immobilier et aux données localisées
 */

export interface VacancyRateRecommendation {
    rate: number;
    reason: string;
    source: string;
}

export interface MarketData {
    averageRent: number;
    vacancyRate: number;
    pricePerM2: number;
    tension: 'low' | 'medium' | 'high';
}

/**
 * Recommande un taux de vacance selon le type de bien et la zone
 */
export function getRecommendedVacancyRate(
    propertyType: string,
    location?: string
): VacancyRateRecommendation {

    // Taux de vacance par défaut selon le type de bien
    const baseRates: Record<string, number> = {
        'neuf': 5,           // Neuf bien situé
        'ancien': 8,         // Ancien rénové
        'saisonnier': 15,    // Saisonnier fluctuant
        'bureau': 12,        // Bureau selon zone
        'commercial': 10,    // Commercial selon activité
        'mixte': 9          // Mixte polyvalent
    };

    const baseRate = baseRates[propertyType] || 8;

    // Ajustement selon la localisation (simulation)
    let adjustedRate = baseRate;
    let reason = `Taux standard pour ${propertyType}`;

    if (location) {
        const lowerLocation = location.toLowerCase();

        // Zones tendues (taux plus bas)
        if (lowerLocation.includes('paris') ||
            lowerLocation.includes('lyon') ||
            lowerLocation.includes('marseille') ||
            lowerLocation.includes('bordeaux') ||
            lowerLocation.includes('nice')) {
            adjustedRate = Math.max(3, baseRate - 3);
            reason = `Zone tendue (${location}) : vacance réduite`;
        }
        // Zones détendues (taux plus élevé)
        else if (lowerLocation.includes('rural') ||
            lowerLocation.includes('campagne') ||
            lowerLocation.includes('montagne')) {
            adjustedRate = Math.min(20, baseRate + 5);
            reason = `Zone détendue (${location}) : vacance majorée`;
        }
    }

    return {
        rate: Math.round(adjustedRate * 10) / 10, // Arrondi à 1 décimale
        reason,
        source: 'Estimation basée sur les statistiques nationales'
    };
}

/**
 * Calcule le coût total du crédit avec assurance
 */
export function calculateTotalLoanCost(
    loanAmount: number,
    interestRate: number,
    duration: number,
    insuranceRate: number = 0.36
): {
    totalInterest: number;
    totalInsurance: number;
    totalCost: number;
    monthlyPayment: number;
    monthlyInsurance: number;
} {
    if (loanAmount <= 0 || duration <= 0) {
        return {
            totalInterest: 0,
            totalInsurance: 0,
            totalCost: 0,
            monthlyPayment: 0,
            monthlyInsurance: 0
        };
    }

    const monthlyRate = interestRate / 100 / 12;
    const numPayments = duration * 12;

    // Calcul mensualité sans assurance
    const monthlyPayment = monthlyRate > 0 ?
        loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1) : loanAmount / numPayments;

    // Assurance emprunteur
    const monthlyInsurance = loanAmount * (insuranceRate / 100) / 12;
    const totalInsurance = monthlyInsurance * numPayments;

    // Intérêts totaux
    const totalPaid = monthlyPayment * numPayments;
    const totalInterest = totalPaid - loanAmount;

    return {
        totalInterest,
        totalInsurance,
        totalCost: totalInterest + totalInsurance,
        monthlyPayment,
        monthlyInsurance
    };
}

/**
 * Validation des plafonds fiscaux en temps réel
 */
export function validateFiscalLimits(
    regime: string,
    annualRent: number,
    propertyType: string,
    meubleTourismeClasse?: boolean
): {
    isValid: boolean;
    maxAllowed: number;
    currentAmount: number;
    message?: string;
} {
    switch (regime) {
        case 'micro-foncier':
            return {
                isValid: annualRent <= 15000,
                maxAllowed: 15000,
                currentAmount: annualRent,
                message: annualRent > 15000 ? 'Dépassement : passez au régime réel foncier' : undefined
            };

        case 'micro-BIC':
            let maxBIC = 77700; // Standard

            if (meubleTourismeClasse) {
                maxBIC = 188700; // Meublé de tourisme classé
            } else if (propertyType === 'saisonnier') {
                maxBIC = 15000; // Saisonnier non classé (réforme 2025)
            }

            return {
                isValid: annualRent <= maxBIC,
                maxAllowed: maxBIC,
                currentAmount: annualRent,
                message: annualRent > maxBIC ? 'Dépassement : passez au régime réel BIC' : undefined
            };

        default:
            return {
                isValid: true,
                maxAllowed: Infinity,
                currentAmount: annualRent
            };
    }
}

/**
 * Estimation de frais de notaire améliorée
 */
export function calculateNotaryFeesAdvanced(
    price: number,
    propertyType: string,
    isFirstHome: boolean = false
): {
    notaryFees: number;
    breakdown: {
        dutiesAndTaxes: number;
        notaryRemuneration: number;
        administrativeCosts: number;
    };
    reductions?: {
        firstHomeBuyer?: number;
        reducedVAT?: number;
    };
} {
    let baseFeeRate: number;
    let canHaveReductions = false;

    // Taux de base selon le type
    switch (propertyType) {
        case 'neuf':
            baseFeeRate = 0.025; // 2,5%
            canHaveReductions = true;
            break;
        case 'ancien':
            baseFeeRate = 0.08; // 8%
            break;
        case 'commercial':
        case 'bureau':
            baseFeeRate = 0.08; // 8%
            break;
        default:
            baseFeeRate = 0.08;
    }

    const baseNotaryFees = price * baseFeeRate;

    // Répartition approximative
    const breakdown = {
        dutiesAndTaxes: baseNotaryFees * 0.75,      // ~75%
        notaryRemuneration: baseNotaryFees * 0.20,   // ~20%
        administrativeCosts: baseNotaryFees * 0.05    // ~5%
    };

    let finalFees = baseNotaryFees;
    const reductions: any = {};

    // Réductions possibles (primo-accédant, etc.)
    if (canHaveReductions && isFirstHome && price <= 300000) {
        const reduction = Math.min(baseNotaryFees * 0.1, 1000); // Max 1000€
        reductions.firstHomeBuyer = reduction;
        finalFees -= reduction;
    }

    return {
        notaryFees: Math.round(finalFees),
        breakdown: {
            dutiesAndTaxes: Math.round(breakdown.dutiesAndTaxes),
            notaryRemuneration: Math.round(breakdown.notaryRemuneration),
            administrativeCosts: Math.round(breakdown.administrativeCosts)
        },
        ...(Object.keys(reductions).length > 0 && { reductions })
    };
} 