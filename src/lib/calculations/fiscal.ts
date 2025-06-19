import {
    ConfigurationPinel,
    ConfigurationMalraux,
    ClasseDPE
} from '../types/calculator';
import { SimulationInput } from '@/schemas/simulation';

// Taux des prélèvements sociaux sur les revenus fonciers et BIC
export const TAUX_PRELEVEMENTS_SOCIAUX = 17.2;

// Plafonds et taux pour les régimes micro
export const PLAFOND_MICRO_FONCIER = 15000;
export const PLAFOND_MICRO_BIC = 77700;
export const PLAFOND_MICRO_BIC_TOURISME = 188700;
export const ABATTEMENT_MICRO_FONCIER = 30;
export const ABATTEMENT_MICRO_BIC = 50;
export const ABATTEMENT_MICRO_BIC_TOURISME = 71;

/**
 * Calcule l'impôt selon le régime fiscal choisi
 */
export function calculateTax(
    annualRent: number,
    annualExpenses: number,
    regime: string,
    tmi: number,
    amortization: number = 0,
    carryForwardAmortization: number = 0
): {
    taxableIncome: number;
    incomeTax: number;
    socialTax: number;
    totalTax: number;
    amortizationUsed: number;
    newCarryForward: number;
} {
    const socialTaxRate = 17.2; // Prélèvements sociaux 2025

    switch (regime) {
        case 'micro-foncier':
            return calculateMicroFoncier(annualRent, tmi, socialTaxRate);

        case 'réel-foncier':
            return calculateReelFoncier(annualRent, annualExpenses, tmi, socialTaxRate);

        case 'micro-BIC':
            return calculateMicroBIC(annualRent, tmi, socialTaxRate);

        case 'réel-BIC':
        case 'LMNP-réel':
        case 'LMP-réel':
            return calculateReelBIC(
                annualRent,
                annualExpenses,
                tmi,
                socialTaxRate,
                amortization,
                carryForwardAmortization
            );

        case 'Pinel':
        case 'Denormandie':
        case 'Malraux':
            // Ces dispositifs utilisent le régime réel foncier + réduction d'impôt
            return calculateReelFoncier(annualRent, annualExpenses, tmi, socialTaxRate);

        default:
            return {
                taxableIncome: 0,
                incomeTax: 0,
                socialTax: 0,
                totalTax: 0,
                amortizationUsed: 0,
                newCarryForward: 0
            };
    }
}

/**
 * Micro-foncier : abattement de 30%
 */
function calculateMicroFoncier(
    annualRent: number,
    tmi: number,
    socialTaxRate: number
) {
    const taxableIncome = annualRent * 0.7; // Abattement 30%
    const incomeTax = taxableIncome * (tmi / 100);
    const socialTax = taxableIncome * (socialTaxRate / 100);

    return {
        taxableIncome,
        incomeTax,
        socialTax,
        totalTax: incomeTax + socialTax,
        amortizationUsed: 0,
        newCarryForward: 0
    };
}

/**
 * Régime réel foncier
 */
function calculateReelFoncier(
    annualRent: number,
    annualExpenses: number,
    tmi: number,
    socialTaxRate: number
) {
    const taxableIncome = Math.max(0, annualRent - annualExpenses);
    const incomeTax = taxableIncome * (tmi / 100);
    const socialTax = taxableIncome * (socialTaxRate / 100);

    return {
        taxableIncome,
        incomeTax,
        socialTax,
        totalTax: incomeTax + socialTax,
        amortizationUsed: 0,
        newCarryForward: 0
    };
}

/**
 * Micro-BIC : abattement de 50% (ou 30% pour locations saisonnières non classées)
 */
function calculateMicroBIC(
    annualRent: number,
    tmi: number,
    socialTaxRate: number,
    abatementRate: number = 50 // Par défaut 50%, 30% pour saisonnier non classé
) {
    const taxableIncome = annualRent * (100 - abatementRate) / 100;
    const incomeTax = taxableIncome * (tmi / 100);
    const socialTax = taxableIncome * (socialTaxRate / 100);

    return {
        taxableIncome,
        incomeTax,
        socialTax,
        totalTax: incomeTax + socialTax,
        amortizationUsed: 0,
        newCarryForward: 0
    };
}

/**
 * Régime réel BIC (LMNP/LMP) avec amortissements
 */
function calculateReelBIC(
    annualRent: number,
    annualExpenses: number,
    tmi: number,
    socialTaxRate: number,
    newAmortization: number,
    carryForwardAmortization: number
) {
    const resultBeforeAmortization = annualRent - annualExpenses;

    if (resultBeforeAmortization <= 0) {
        // Déficit : on ne peut pas utiliser d'amortissement
        return {
            taxableIncome: Math.max(0, resultBeforeAmortization),
            incomeTax: 0,
            socialTax: 0,
            totalTax: 0,
            amortizationUsed: 0,
            newCarryForward: carryForwardAmortization + newAmortization
        };
    }

    // Utilisation des amortissements : d'abord le report, puis le nouveau
    const totalAmortizationAvailable = carryForwardAmortization + newAmortization;
    const amortizationUsed = Math.min(totalAmortizationAvailable, resultBeforeAmortization);
    const newCarryForward = totalAmortizationAvailable - amortizationUsed;

    const taxableIncome = Math.max(0, resultBeforeAmortization - amortizationUsed);
    const incomeTax = taxableIncome * (tmi / 100);
    const socialTax = taxableIncome * (socialTaxRate / 100);

    return {
        taxableIncome,
        incomeTax,
        socialTax,
        totalTax: incomeTax + socialTax,
        amortizationUsed,
        newCarryForward
    };
}

/**
 * Calcule les amortissements LMNP
 */
export function calculateLMNPAmortization(
    propertyPrice: number,
    furnitureValue: number = 0,
    worksValue: number = 0
): {
    buildingAmortization: number;
    furnitureAmortization: number;
    worksAmortization: number;
    totalAmortization: number;
} {
    // Bâtiment : 85% du prix sur 25 ans (le terrain 15% n'est pas amortissable)
    const buildingValue = propertyPrice * 0.85;
    const buildingAmortization = buildingValue / 25;

    // Mobilier : sur 7 ans
    const furnitureAmortization = furnitureValue / 7;

    // Travaux : sur 10 ans en moyenne
    const worksAmortization = worksValue / 10;

    const totalAmortization = buildingAmortization + furnitureAmortization + worksAmortization;

    return {
        buildingAmortization,
        furnitureAmortization,
        worksAmortization,
        totalAmortization
    };
}

/**
 * Calcule la réduction d'impôt pour les dispositifs de défiscalisation
 */
export function calculateTaxReduction(
    regime: string,
    propertyPrice: number,
    duration?: number,
    worksAmount?: number
): {
    annualReduction: number;
    totalReduction: number;
    duration: number;
} {
    switch (regime) {
        case 'Pinel':
        case 'Denormandie':
            return calculatePinelReduction(propertyPrice, duration || 9, worksAmount);

        case 'Malraux':
            return calculateMalrauxReduction(worksAmount || 0);

        default:
            return { annualReduction: 0, totalReduction: 0, duration: 0 };
    }
}

/**
 * Réduction Pinel/Denormandie
 */
function calculatePinelReduction(
    propertyPrice: number,
    duration: number,
    worksAmount: number = 0
): {
    annualReduction: number;
    totalReduction: number;
    duration: number;
} {
    const base = Math.min(propertyPrice + worksAmount, 300000); // Plafond 300k€

    let reductionRate: number;
    switch (duration) {
        case 6:
            reductionRate = 12;
            break;
        case 9:
            reductionRate = 18;
            break;
        case 12:
            reductionRate = 21;
            break;
        default:
            reductionRate = 18; // Par défaut 9 ans
    }

    const totalReduction = base * (reductionRate / 100);
    const annualReduction = totalReduction / duration;

    return {
        annualReduction,
        totalReduction,
        duration
    };
}

/**
 * Réduction Malraux
 */
function calculateMalrauxReduction(worksAmount: number): {
    annualReduction: number;
    totalReduction: number;
    duration: number;
} {
    const maxWorks = Math.min(worksAmount, 400000); // Plafond 400k€ sur 4 ans
    const reductionRate = 30; // 30% en secteur PSMV (22% en secteur NPNRU)
    const duration = 4; // Étalé sur 4 ans

    const totalReduction = maxWorks * (reductionRate / 100);
    const annualReduction = totalReduction / duration;

    return {
        annualReduction,
        totalReduction,
        duration
    };
}

/**
 * Calcule la plus-value immobilière à la revente
 */
export function calculateCapitalGainsTax(
    salePrice: number,
    acquisitionPrice: number,
    acquisitionCosts: number,
    yearsHeld: number
): {
    grossCapitalGain: number;
    taxableCapitalGainIR: number;
    taxableCapitalGainPS: number;
    incomeTax: number;
    socialTax: number;
    totalTax: number;
} {
    const grossCapitalGain = salePrice - acquisitionPrice - acquisitionCosts;

    if (grossCapitalGain <= 0 || yearsHeld >= 30) {
        return {
            grossCapitalGain,
            taxableCapitalGainIR: 0,
            taxableCapitalGainPS: 0,
            incomeTax: 0,
            socialTax: 0,
            totalTax: 0
        };
    }

    // Abattements pour durée de détention
    const irAbatement = calculateIRAbatement(yearsHeld);
    const psAbatement = calculatePSAbatement(yearsHeld);

    const taxableCapitalGainIR = grossCapitalGain * (1 - irAbatement / 100);
    const taxableCapitalGainPS = grossCapitalGain * (1 - psAbatement / 100);

    const incomeTax = taxableCapitalGainIR * 0.19; // 19%
    const socialTax = taxableCapitalGainPS * 0.172; // 17.2%

    return {
        grossCapitalGain,
        taxableCapitalGainIR,
        taxableCapitalGainPS,
        incomeTax,
        socialTax,
        totalTax: incomeTax + socialTax
    };
}

/**
 * Abattement IR sur plus-value selon durée détention
 */
function calculateIRAbatement(years: number): number {
    if (years < 6) return 0;
    if (years < 22) return (years - 5) * 6;
    if (years === 22) return 102; // 17*6 + 4
    return 100; // Exonération totale après 22 ans
}

/**
 * Abattement PS sur plus-value selon durée détention
 */
function calculatePSAbatement(years: number): number {
    if (years < 6) return 0;
    if (years < 22) return (years - 5) * 1.65;
    if (years === 22) return 29.05; // 17*1.65 + 1.6
    if (years < 30) return 29.05 + (years - 22) * 9;
    return 100; // Exonération totale après 30 ans
}

/**
 * Configuration des dispositifs Pinel selon l'année et la durée
 */
export function getConfigurationPinel(anneePinel: number, duree: 6 | 9 | 12): ConfigurationPinel {
    // Taux de réduction selon l'année d'investissement
    let tauxReduction: number;

    if (anneePinel <= 2022) {
        // Ancien Pinel
        switch (duree) {
            case 6: tauxReduction = 12; break;
            case 9: tauxReduction = 18; break;
            case 12: tauxReduction = 21; break;
        }
    } else {
        // Pinel réformé 2023+
        switch (duree) {
            case 6: tauxReduction = 9; break;
            case 9: tauxReduction = 12; break;
            case 12: tauxReduction = 14; break;
        }
    }

    // Répartition de la réduction sur les années
    const repartition: number[] = [];
    if (duree === 12) {
        // 2% les 9 premières années, 1% les 3 dernières
        for (let i = 0; i < 9; i++) repartition.push(2);
        for (let i = 0; i < 3; i++) repartition.push(1);
    } else {
        // Répartition uniforme
        const tauxAnnuel = tauxReduction / duree;
        for (let i = 0; i < duree; i++) repartition.push(tauxAnnuel);
    }

    return { tauxReduction, repartition };
}

/**
 * Calcule la réduction d'impôt Pinel pour une année donnée
 */
export function calculerReductionPinel(
    prixAchat: number,
    anneeInvestissement: number,
    duree: 6 | 9 | 12,
    anneeCalcul: number
): number {
    const config = getConfigurationPinel(anneeInvestissement, duree);
    const anneeDepuisInvestissement = anneeCalcul - anneeInvestissement + 1;

    if (anneeDepuisInvestissement < 1 || anneeDepuisInvestissement > duree) {
        return 0;
    }

    const plafondPrix = 300000; // Plafond Pinel
    const prixRetenu = Math.min(prixAchat, plafondPrix);
    const tauxAnnuel = config.repartition[anneeDepuisInvestissement - 1];

    return prixRetenu * tauxAnnuel / 100;
}

/**
 * Configuration Malraux
 */
export function getConfigurationMalraux(zone: 'secteur_sauvegarde' | 'autre'): ConfigurationMalraux {
    return {
        tauxReduction: zone === 'secteur_sauvegarde' ? 30 : 22,
        plafondTravaux: 400000
    };
}

/**
 * Calcule la réduction d'impôt Malraux
 */
export function calculerReductionMalraux(
    montantTravaux: number,
    zone: 'secteur_sauvegarde' | 'autre',
    dureeTravauxAnnees: number = 4
): number {
    const config = getConfigurationMalraux(zone);
    const travauxRetenus = Math.min(montantTravaux, config.plafondTravaux);
    const reductionTotale = travauxRetenus * config.tauxReduction / 100;

    // Répartition sur la durée des travaux
    return reductionTotale / dureeTravauxAnnees;
}

/**
 * Vérifie les contraintes DPE selon la réglementation
 */
export function verifierContraintesDPE(
    classeDPE: ClasseDPE,
    annee: number
): {
    locationAutorisee: boolean;
    gelLoyers: boolean;
    messageAlerte?: string;
} {
    let locationAutorisee = true;
    let gelLoyers = false;
    let messageAlerte: string | undefined;

    // Gel des loyers pour F et G depuis août 2022
    if (classeDPE === 'F' || classeDPE === 'G') {
        gelLoyers = true;
    }

    // Interdictions progressives
    if (classeDPE === 'G' && annee >= 2025) {
        locationAutorisee = false;
        messageAlerte = "DPE G : location interdite depuis 2025. Rénovation énergétique obligatoire.";
    } else if (classeDPE === 'F' && annee >= 2028) {
        locationAutorisee = false;
        messageAlerte = "DPE F : location interdite depuis 2028. Rénovation énergétique obligatoire.";
    } else if (classeDPE === 'E' && annee >= 2034) {
        locationAutorisee = false;
        messageAlerte = "DPE E : location interdite depuis 2034. Rénovation énergétique obligatoire.";
    }

    return {
        locationAutorisee,
        gelLoyers,
        messageAlerte
    };
}

/**
 * Estime automatiquement les frais de notaire
 */
export function estimerFraisNotaire(prixAchat: number, typeBien: 'ancien' | 'neuf'): number {
    if (typeBien === 'neuf') {
        return prixAchat * 0.025; // 2.5% pour le neuf
    } else {
        return prixAchat * 0.08; // 8% pour l'ancien
    }
} 