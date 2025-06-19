import { z } from 'zod';

export const simulationSchema = z.object({
    propertyType: z.enum(["neuf", "ancien", "saisonnier", "bureau", "commercial", "mixte"], {
        required_error: "Veuillez sélectionner un type de bien"
    }),
    usageType: z.enum(["locatif", "professionnel", "mixte_pro_locatif"]).optional(),
    price: z.number().min(1, "Le prix d'achat doit être > 0"),
    notaryFees: z.number().min(0, "Les frais de notaire doivent être ≥ 0"),
    surface: z.number().min(1, "La surface doit être > 0"),
    downPayment: z.number().min(0, "L'apport doit être ≥ 0"),
    loanAmount: z.number().min(0, "Le montant du prêt doit être ≥ 0"),
    interestRate: z.number().min(0, "Taux d'intérêt ≥ 0").max(20, "Taux d'intérêt trop élevé"),
    loanDuration: z.number().int().min(0).max(30, "Durée max 30 ans"),
    insuranceRate: z.number().min(0).max(10, "Taux d'assurance invalide"),
    rentMonthly: z.number().min(0, "Loyer mensuel ≥ 0"),
    chargesRecoverableMonthly: z.number().min(0),
    // Séparation des charges non récupérables pour plus de précision
    propertyTaxMonthly: z.number().min(0, "La taxe foncière doit être ≥ 0"),
    condoFeesMonthly: z.number().min(0, "Les charges de copropriété doivent être ≥ 0"),
    managementFeesMonthly: z.number().min(0, "Les frais de gestion doivent être ≥ 0"),
    insuranceMonthly: z.number().min(0, "L'assurance doit être ≥ 0"),
    otherExpensesMonthly: z.number().min(0, "Les autres charges doivent être ≥ 0"),
    vacancyRate: z.number().min(0).max(20, "Vacance locative limitée à 20% (valeur réaliste)"),
    regime: z.enum([
        "micro-foncier",
        "réel-foncier",
        "micro-BIC",
        "réel-BIC",
        "LMNP-réel",
        "LMP-réel",
        "Pinel",
        "Denormandie",
        "Malraux"
    ], {
        required_error: "Veuillez sélectionner un régime fiscal"
    }),
    subOptions: z.object({
        pinelDuration: z.number().optional(),
        worksAmount: z.number().min(0).optional(),
        lmnpIsLMP: z.boolean().optional(),
        meubleTourismeClasse: z.boolean().optional()
    }).optional(),
    taxpayerTMI: z.number().min(0).max(60, "TMI invalide"), // TMI en %, max 60%
    dpeClass: z.enum(["A", "B", "C", "D", "E", "F", "G"]).optional(),
    resaleYear: z.number().int().min(0).max(30),
    appreciationRate: z.number().min(-10).max(15), // Appréciation entre -10% et +15%/an
    rentIndexationRate: z.number().min(0).max(5).optional().default(1.5), // Indexation annuelle des loyers
    useGlobalChargesMode: z.boolean().optional().default(false), // Mode forfait charges global
    globalMonthlyCharges: z.number().min(0).optional(), // Forfait charges global si activé
    includeResaleAnalysis: z.boolean().optional().default(true), // Analyse à la revente
    anticipatedResaleYear: z.number().int().min(1).max(30).optional(), // Année de revente anticipée
})
    // Règles de validation conditionnelles
    .refine(data => {
        // Cohérence financement : apport ≤ coût total
        const totalCost = data.price + data.notaryFees;
        return data.downPayment <= totalCost;
    }, { message: "L'apport ne peut excéder le coût total (prix + frais notaire)", path: ["downPayment"] })
    .refine(data => {
        // Alerte financement minimal bancaire
        if (data.loanAmount > 0 && data.loanAmount < 10000) {
            return false; // Force une validation qui échouera
        }
        return true;
    }, { message: "Montant minimal bancaire : 10 000€. En dessous, peu de banques financent.", path: ["loanAmount"] })
    .refine(data => {
        // Taux obligatoire si prêt
        if (data.loanDuration > 0 && data.loanAmount > 0) {
            return data.interestRate > 0;
        }
        return true;
    }, { message: "Taux d'intérêt obligatoire si un prêt est renseigné", path: ["interestRate"] })
    .refine(data => {
        // Validation micro-foncier
        if (data.regime === "micro-foncier") {
            const annualRent = data.rentMonthly * 12;
            return annualRent <= 15000;
        }
        return true;
    }, { message: "Loyers excèdent 15k€, micro-foncier indisponible", path: ["regime"] })
    .refine(data => {
        // Validation micro-BIC
        if (data.regime === "micro-BIC") {
            const annualRent = data.rentMonthly * 12;
            if (data.subOptions?.meubleTourismeClasse) {
                // Meublé de tourisme classé : plafond 188 700€
                return annualRent <= 188700;
            } else if (data.propertyType === "saisonnier") {
                // Meublé saisonnier non classé (réforme 2025) : plafond 15 000€
                return annualRent <= 15000;
            } else {
                // Meublé normal (LMNP classique) : plafond 77 700€
                return annualRent <= 77700;
            }
        }
        return true;
    }, { message: "Recettes excèdent le plafond du régime micro-BIC", path: ["regime"] })
    .refine(data => {
        // Pinel seulement sur neuf
        if (data.regime === "Pinel") {
            return data.propertyType === "neuf";
        }
        return true;
    }, { message: "Le dispositif Pinel ne s'applique qu'aux biens neufs", path: ["regime"] })
    .refine(data => {
        // Denormandie sur ancien
        if (data.regime === "Denormandie") {
            return data.propertyType === "ancien";
        }
        return true;
    }, { message: "Le dispositif Denormandie ne s'applique qu'aux biens anciens avec travaux", path: ["regime"] })
    .refine(data => {
        // Malraux sur ancien
        if (data.regime === "Malraux") {
            return data.propertyType === "ancien";
        }
        return true;
    }, { message: "Le dispositif Malraux ne s'applique qu'aux biens anciens en secteur éligible", path: ["regime"] })
    .refine(data => {
        // Validation conditionnelle Pinel - durée obligatoire
        if (data.regime === "Pinel") {
            return data.subOptions?.pinelDuration && [6, 9, 12].includes(data.subOptions.pinelDuration);
        }
        return true;
    }, { message: "Durée d'engagement Pinel obligatoire (6, 9 ou 12 ans)", path: ["subOptions", "pinelDuration"] })
    .refine(data => {
        // Validation conditionnelle Denormandie - montant travaux
        if (data.regime === "Denormandie") {
            return data.subOptions?.worksAmount && data.subOptions.worksAmount >= 10000;
        }
        return true;
    }, { message: "Denormandie : montant minimal de travaux requis (≥ 10 000€)", path: ["subOptions", "worksAmount"] })
    .refine(data => {
        // Validation usage mixte commercial
        if (data.propertyType === "bureau" || data.propertyType === "commercial") {
            return data.usageType && data.usageType !== "locatif";
        }
        return true;
    }, { message: "Biens commerciaux : usage professionnel ou mixte requis", path: ["usageType"] })
    .refine(data => {
        // Validation mode forfait charges
        if (data.useGlobalChargesMode) {
            return data.globalMonthlyCharges && data.globalMonthlyCharges > 0;
        }
        return true;
    }, { message: "Mode forfait activé : montant des charges globales requis", path: ["globalMonthlyCharges"] });

export type SimulationInput = z.infer<typeof simulationSchema>;

// Types pour les résultats
export interface YearlyProjection {
    year: number;
    rentGross: number;
    rentEffective: number;
    expenses: number;
    interestPaid: number;
    principalPaid: number;
    taxableIncome: number;
    incomeTax: number;
    socialTax: number;
    cashflow: number;
    cumulatedCashflow: number;
    loanRemaining: number;
    propertyValue: number;
    potentialCapitalGain: number;
    amortization?: number;
    amortizationUsed?: number;
    amortizationCarryForward?: number;
}

export interface SimulationResult {
    assumptions: SimulationInput;
    yearlyProjections: YearlyProjection[];
    paybackYear?: number;
    irr: { year10: number, year20: number, year30: number };
    roi: number;
    yieldGross: number;
    yieldNet: number;
    yieldNetNet: number;
    avgCashflowMonthly: number;
    totalTaxPaid: number;
    totalInvestment: number;
    totalProfit: number;
    monthlyCashflow: number;
    totalAcquisitionCost: number;
} 