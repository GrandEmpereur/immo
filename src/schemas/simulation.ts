import { z } from 'zod';

export const simulationSchema = z.object({
    propertyType: z.enum(["neuf", "ancien", "saisonnier"], {
        required_error: "Veuillez sélectionner un type de bien"
    }),
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
    vacancyRate: z.number().min(0).max(100, "Vacance en % (0-100)"),
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
    appreciationRate: z.number().min(-10).max(15) // Appréciation entre -10% et +15%/an
})
    // Règles de validation conditionnelles
    .refine(data => {
        // Cohérence financement
        return data.downPayment <= data.price + data.notaryFees;
    }, { message: "L'apport ne peut excéder le coût total", path: ["downPayment"] })
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
                // Meublé classé
                return annualRent <= 77700;
            } else if (data.propertyType === "saisonnier") {
                // Meublé non classé (réforme 2025)
                return annualRent <= 15000;
            } else {
                // Meublé normal
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
    }, { message: "Le dispositif Malraux ne s'applique qu'aux biens anciens en secteur éligible", path: ["regime"] });

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