import {
    ParametresInvestissement,
    IndicateursRentabilite,
    ResultatsAnnuels
} from '../types/calculator';

import {
    calculerMensualite,
    genererTableauAmortissement,
    calculerInteretsAnnuels,
    calculerCapitalRembourseAnnuel,
    calculerCapitalRestantAnnuel,
    calculerAbattementPlusValue,
    calculateLoanPayment,
    generateAmortizationSchedule,
    calculateYields,
    calculateIRR,
    calculatePropertyValue,
    calculateMonthlyCashflow
} from './financial';

import {
    calculateTax,
    calculateLMNPAmortization,
    calculateTaxReduction,
    calculerReductionPinel,
    calculerReductionMalraux,
    verifierContraintesDPE,
    estimerFraisNotaire,
    calculateCapitalGainsTax
} from './fiscal';

import { SimulationInput, SimulationResult, YearlyProjection } from '@/schemas/simulation';

/**
 * Moteur principal de calcul de rentabilité immobilière
 */
export function calculerRentabiliteImmobiliere(params: ParametresInvestissement): IndicateursRentabilite {
    // 1. Calculs préliminaires
    const coutTotal = params.prixAchat + params.fraisNotaire + params.fraisAgence + params.travaux;
    const loyerAnnuelBrut = params.loyerMensuel * 12;
    const loyerAnnuelNet = loyerAnnuelBrut * (1 - params.vacanceLocative / 100);

    // 2. Tableau d'amortissement du prêt
    const tableauAmortissement = genererTableauAmortissement(
        params.montantPret,
        params.tauxPret,
        params.dureePret
    );

    const mensualitePret = calculerMensualite(params.montantPret, params.tauxPret, params.dureePret);

    // 3. Charges annuelles totales
    const chargesAnnuellesInitiales =
        params.chargesCopropriete +
        params.fraisEntretienGestion +
        params.assuranceHabitation +
        params.taxeFonciere;

    // 4. Calculs année par année
    const resultatsAnnuels: ResultatsAnnuels[] = [];
    let amortissementReporteCumule = 0;
    const anneeActuelle = new Date().getFullYear();

    for (let annee = 1; annee <= params.dureeProjection; annee++) {
        const anneeCalcul = anneeActuelle + annee - 1;

        // Revenus locatifs avec inflation
        const loyersBruts = loyerAnnuelBrut * Math.pow(1 + params.tauxInflationLoyers / 100, annee - 1);

        // Vérification contraintes DPE
        const contrainteDPE = verifierContraintesDPE(params.classeDPE, anneeCalcul);
        const loyersEffectifs = contrainteDPE.locationAutorisee ? loyersBruts : 0;
        const loyersNets = loyersEffectifs * (1 - params.vacanceLocative / 100);

        // Gel des loyers pour DPE F/G
        const loyersFinaux = contrainteDPE.gelLoyers ?
            Math.min(loyersNets, loyerAnnuelNet) : loyersNets;

        // Charges avec inflation
        const chargesAnnuelles = chargesAnnuellesInitiales * Math.pow(1 + params.tauxInflationCharges / 100, annee - 1);

        // Intérêts et capital du prêt
        const interetsPayes = calculerInteretsAnnuels(tableauAmortissement, annee);
        const capitalRembourse = calculerCapitalRembourseAnnuel(tableauAmortissement, annee);
        const capitalRestantDu = calculerCapitalRestantAnnuel(tableauAmortissement, annee);

        // Valeur du bien avec appréciation
        const valeurBien = coutTotal * Math.pow(1 + params.tauxAppreciationBien / 100, annee - 1);

        // Calcul de l'amortissement (LMNP uniquement)
        let amortissement = 0;
        if (params.locationType === 'meublee' && params.regimeFiscal === 'reel') {
            const valeurMobilier = Math.min(coutTotal * 0.1, 5000); // Estimation mobilier
            const amortissementAnnuel = calculateLMNPAmortization(
                params.prixAchat,
                valeurMobilier,
                0 // travaux
            );
            amortissement = amortissementAnnuel.totalAmortization + amortissementReporteCumule;
        }

        // Calcul fiscal selon le régime
        let fiscalResult;
        if (params.locationType === 'nue') {
            fiscalResult = calculateTax(
                loyersFinaux,
                chargesAnnuelles + interetsPayes,
                params.regimeFiscal,
                params.trancheMarginalImposition
            );
        } else if (params.statusLoueur === 'lmp') {
            fiscalResult = calculateTax(
                loyersFinaux,
                chargesAnnuelles + interetsPayes,
                'LMP-réel',
                params.trancheMarginalImposition,
                amortissement,
                amortissementReporteCumule
            );
        } else {
            fiscalResult = calculateTax(
                loyersFinaux,
                chargesAnnuelles + interetsPayes,
                'LMNP-réel',
                params.trancheMarginalImposition,
                amortissement,
                amortissementReporteCumule
            );
            amortissementReporteCumule = fiscalResult.newCarryForward;
        }

        // Réductions d'impôt
        let reductionImpot = 0;
        if (params.dispositif === 'pinel' && params.dureePinel && params.anneePinel) {
            reductionImpot = calculerReductionPinel(
                params.prixAchat,
                params.anneePinel,
                params.dureePinel,
                anneeCalcul
            );
        } else if (params.dispositif === 'denormandie' && params.dureePinel && params.anneePinel) {
            reductionImpot = calculerReductionPinel(
                coutTotal, // Prix de revient (achat + travaux)
                params.anneePinel,
                params.dureePinel,
                anneeCalcul
            );
        } else if (params.dispositif === 'malraux' && params.montantTravauxMalraux && params.zoneMalraux) {
            reductionImpot = calculerReductionMalraux(
                params.montantTravauxMalraux,
                params.zoneMalraux
            );
        }

        // Cash-flows
        const annuitesPret = (mensualitePret * 12) || 0;
        // Ajout de l'assurance emprunteur oubliée dans l'audit
        const assuranceEmprunteurAnnuelle = params.montantPret * (params.assuranceEmprunteur || 0) / 100;
        const cashFlowAvantImpot = loyersFinaux - chargesAnnuelles - annuitesPret - assuranceEmprunteurAnnuelle;
        const impotNet = Math.max(0, fiscalResult.totalTax - reductionImpot);
        const cashFlowApresImpot = cashFlowAvantImpot - impotNet;

        const cashFlowCumule = annee === 1 ?
            cashFlowApresImpot :
            resultatsAnnuels[annee - 2].cashFlowCumule + cashFlowApresImpot;

        resultatsAnnuels.push({
            annee,
            loyersBruts: loyersEffectifs,
            loyersNets: loyersFinaux,
            chargesAnnuelles,
            interetsPayes,
            capitalRembourse,
            capitalRestantDu,
            amortissement,
            revenuImposable: fiscalResult.taxableIncome,
            impotIR: fiscalResult.incomeTax || 0,
            prelevementsSociaux: fiscalResult.socialTax || 0,
            reductionImpot,
            cashFlowAvantImpot,
            cashFlowApresImpot,
            cashFlowCumule,
            valeurBien
        });
    }

    // 5. Calcul des indicateurs de rentabilité
    const premiereAnnee = resultatsAnnuels[0];
    const derniereAnnee = resultatsAnnuels[resultatsAnnuels.length - 1];

    // Rentabilités
    const rentabiliteBrute = (loyerAnnuelBrut / coutTotal) * 100;
    const rentabiliteNette = ((loyerAnnuelNet - chargesAnnuellesInitiales) / coutTotal) * 100;
    const rentabiliteNetteNette = ((premiereAnnee.loyersNets - premiereAnnee.chargesAnnuelles - premiereAnnee.impotIR - premiereAnnee.prelevementsSociaux) / coutTotal) * 100;

    // Cash-flows
    const cashFlowMensuel = premiereAnnee.cashFlowApresImpot / 12;
    const cashFlowAnnuel = premiereAnnee.cashFlowApresImpot;

    // Plus-value à la revente
    const prixRevente = derniereAnnee.valeurBien;
    const plusValueBrute = prixRevente - coutTotal;
    const abattements = calculerAbattementPlusValue(params.dureeProjection);
    const plusValueImposableIR = plusValueBrute * (1 - abattements.abattementIR / 100);
    const plusValueImposablePS = plusValueBrute * (1 - abattements.abattementPS / 100);
    const impotPlusValue = (plusValueImposableIR * 0.19) + (plusValueImposablePS * 0.172);
    const plusValueNette = plusValueBrute - impotPlusValue;

    // Calcul du TRI
    const fluxTresorerie = [-params.apportPersonnel]; // Investissement initial
    for (const resultat of resultatsAnnuels) {
        fluxTresorerie.push(resultat.cashFlowApresImpot);
    }
    // Ajout de la revente
    fluxTresorerie[fluxTresorerie.length - 1] += plusValueNette + derniereAnnee.capitalRestantDu;

    const tri = calculateIRR(fluxTresorerie) || 0;

    // ROI
    const gainTotal = derniereAnnee.cashFlowCumule + plusValueNette;
    const roi = params.apportPersonnel > 0 ? (gainTotal / params.apportPersonnel) * 100 : 0;

    // Totaux
    const totalImpots = resultatsAnnuels.reduce((sum, r) => sum + r.impotIR + r.prelevementsSociaux, 0);
    const totalReductions = resultatsAnnuels.reduce((sum, r) => sum + r.reductionImpot, 0);

    return {
        rentabiliteBrute,
        rentabiliteNette,
        rentabiliteNetteNette,
        cashFlowMensuel,
        cashFlowAnnuel,
        tri,
        roi,
        totalImpots,
        totalReductions,
        plusValueBrute,
        plusValueNette,
        prixRevente,
        impotPlusValue,
        gainTotal,
        resultatProjection: resultatsAnnuels
    };
}

/**
 * Fonction helper pour valider et compléter les paramètres
 */
export function completerParametres(params: Partial<ParametresInvestissement>): ParametresInvestissement {
    const defaultParams: ParametresInvestissement = {
        // Acquisition
        prixAchat: 0,
        fraisNotaire: 0,
        fraisAgence: 0,
        travaux: 0,
        apportPersonnel: 0,

        // Financement
        montantPret: 0,
        dureePret: 20,
        tauxPret: 3.5,
        assuranceEmprunteur: 0.36,

        // Bien immobilier
        surface: 50,
        typeBien: 'ancien',
        classeDPE: 'D',

        // Revenus locatifs
        loyerMensuel: 0,
        chargesRecuperables: 0,
        vacanceLocative: 8,

        // Charges annuelles
        chargesCopropriete: 0,
        fraisEntretienGestion: 0,
        assuranceHabitation: 200,
        taxeFonciere: 0,

        // Fiscalité
        locationType: 'nue',
        regimeFiscal: 'micro',
        dispositif: 'aucun',
        trancheMarginalImposition: 30,

        // Projections
        dureeProjection: 20,
        tauxInflationLoyers: 1.5,
        tauxInflationCharges: 2,
        tauxAppreciationBien: 2
    };

    const completedParams = { ...defaultParams, ...params };

    // Auto-calcul des frais de notaire si non fournis
    if (!completedParams.fraisNotaire && completedParams.prixAchat > 0) {
        completedParams.fraisNotaire = estimerFraisNotaire(completedParams.prixAchat, completedParams.typeBien);
    }

    // Auto-calcul du montant du prêt si non fourni
    if (!completedParams.montantPret && completedParams.prixAchat > 0) {
        const coutTotal = completedParams.prixAchat + completedParams.fraisNotaire + completedParams.fraisAgence + completedParams.travaux;
        completedParams.montantPret = Math.max(0, coutTotal - completedParams.apportPersonnel);
    }

    // Validation et cohérence
    if (completedParams.locationType === 'meublee' && !completedParams.statusLoueur) {
        completedParams.statusLoueur = 'lmnp';
    }

    if (completedParams.dispositif === 'pinel' && !completedParams.anneePinel) {
        completedParams.anneePinel = new Date().getFullYear();
    }

    if ((completedParams.dispositif === 'pinel' || completedParams.dispositif === 'denormandie') && !completedParams.dureePinel) {
        completedParams.dureePinel = 9;
    }

    return completedParams;
}

/**
 * Fonction principale de simulation d'investissement
 */
export function simulateInvestment(input: SimulationInput): SimulationResult {
    // Validation des données d'entrée
    if (!input.price || !input.rentMonthly) {
        throw new Error("Prix d'achat et loyer mensuel requis");
    }

    // Calculs de base
    const totalAcquisitionCost = input.price + input.notaryFees;
    const annualRent = input.rentMonthly * 12;
    const effectiveAnnualRent = annualRent * (1 - input.vacancyRate / 100);
    // Calcul du total des charges non récupérables
    const totalNonRecoverableMonthly = (input.propertyTaxMonthly || 0) +
        (input.condoFeesMonthly || 0) + (input.managementFeesMonthly || 0) +
        (input.insuranceMonthly || 0) + (input.otherExpensesMonthly || 0);
    const annualExpenses = totalNonRecoverableMonthly * 12;

    // Plan d'amortissement du prêt
    const loanSchedule = generateAmortizationSchedule(
        input.loanAmount,
        input.interestRate,
        input.loanDuration
    );

    // Calcul des amortissements LMNP si applicable
    const isLMNP = ['réel-BIC', 'LMNP-réel', 'LMP-réel'].includes(input.regime);
    const lmnpAmortization = isLMNP ?
        calculateLMNPAmortization(input.price, input.price * 0.05) : // 5% mobilier estimé
        { totalAmortization: 0, buildingAmortization: 0, furnitureAmortization: 0, worksAmortization: 0 };

    // Réductions d'impôt si dispositif de défiscalisation
    const taxReduction = calculateTaxReduction(
        input.regime,
        input.price,
        input.subOptions?.pinelDuration,
        input.subOptions?.worksAmount
    );

    // Projection année par année
    const yearlyProjections: YearlyProjection[] = [];
    let carryForwardAmortization = 0;
    let cumulatedCashflow = 0;

    const maxYears = Math.max(input.loanDuration, input.resaleYear, 30);

    for (let year = 1; year <= maxYears; year++) {
        const loanData = loanSchedule.find(l => l.year === year) ||
            { interestPaid: 0, principalPaid: 0, remainingBalance: 0 };

        // Revenus avec indexation annuelle des loyers
        const indexationRate = input.rentIndexationRate || 1.5;
        const indexedRent = effectiveAnnualRent * Math.pow(1 + indexationRate / 100, year - 1);
        const yearRent = indexedRent;

        // Charges selon le mode (détaillé ou forfait global)
        let yearlyCharges: number;
        if (input.useGlobalChargesMode && input.globalMonthlyCharges) {
            yearlyCharges = input.globalMonthlyCharges * 12;
        } else {
            yearlyCharges = annualExpenses;
        }

        const yearExpenses = yearlyCharges + loanData.interestPaid;

        // Calcul fiscal
        const taxResult = calculateTax(
            yearRent,
            yearExpenses,
            input.regime,
            input.taxpayerTMI,
            lmnpAmortization.totalAmortization,
            carryForwardAmortization
        );

        // Mise à jour du report d'amortissement
        carryForwardAmortization = taxResult.newCarryForward;

        // Réduction d'impôt si applicable
        let taxReductionAmount = 0;
        if (year <= taxReduction.duration) {
            taxReductionAmount = taxReduction.annualReduction;
        }

        // Impôt net après réduction
        const netIncomeTax = Math.max(0, taxResult.incomeTax - taxReductionAmount);
        const totalTax = netIncomeTax + taxResult.socialTax;

        // Cash-flow de l'année
        const yearCashflow = yearRent - annualExpenses - loanData.interestPaid -
            loanData.principalPaid - totalTax;
        cumulatedCashflow += yearCashflow;

        // Valeur du bien
        const propertyValue = calculatePropertyValue(input.price, year, input.appreciationRate);

        // Plus-value potentielle
        const potentialCapitalGain = propertyValue - input.price;

        yearlyProjections.push({
            year,
            rentGross: annualRent,
            rentEffective: yearRent,
            expenses: annualExpenses + loanData.interestPaid,
            interestPaid: loanData.interestPaid,
            principalPaid: loanData.principalPaid,
            taxableIncome: taxResult.taxableIncome,
            incomeTax: netIncomeTax,
            socialTax: taxResult.socialTax,
            cashflow: yearCashflow,
            cumulatedCashflow,
            loanRemaining: loanData.remainingBalance,
            propertyValue,
            potentialCapitalGain,
            amortization: lmnpAmortization.totalAmortization,
            amortizationUsed: taxResult.amortizationUsed,
            amortizationCarryForward: carryForwardAmortization
        });
    }

    // Calculs des indicateurs synthétiques
    const firstYearProjection = yearlyProjections[0];
    const yields = calculateYields(
        effectiveAnnualRent,
        annualExpenses,
        firstYearProjection.incomeTax + firstYearProjection.socialTax,
        totalAcquisitionCost
    );

    // Cash-flow mensuel moyen (première année)
    const monthlyPayment = input.loanAmount > 0 ?
        calculateLoanPayment(input.loanAmount, input.interestRate, input.loanDuration) : 0;
    const monthlyCashflow = calculateMonthlyCashflow(
        input.rentMonthly,
        totalNonRecoverableMonthly,
        monthlyPayment,
        (firstYearProjection.incomeTax + firstYearProjection.socialTax) / 12
    );

    // Calcul du TRI avec gestion robuste des durées
    const irr10 = calculateIRRForPeriod(input, yearlyProjections, 10);
    const irr20 = calculateIRRForPeriod(input, yearlyProjections, 20);
    const irr30 = calculateIRRForPeriod(input, yearlyProjections, 30);

    // ROI global
    const totalInvestment = input.downPayment +
        yearlyProjections.filter(y => y.cashflow < 0).reduce((sum, y) => sum + Math.abs(y.cashflow), 0);

    const finalValue = input.resaleYear > 0 ?
        calculateResaleValue(input, yearlyProjections[input.resaleYear - 1]) : 0;

    const totalProfit = cumulatedCashflow + finalValue - totalInvestment;
    const roi = totalInvestment > 0 ? (totalProfit / totalInvestment) * 100 : 0;

    // Recherche du point mort
    const paybackYear = yearlyProjections.find(y => y.cumulatedCashflow >= 0)?.year;

    return {
        assumptions: input,
        yearlyProjections,
        paybackYear,
        irr: { year10: irr10, year20: irr20, year30: irr30 },
        roi,
        yieldGross: yields.gross,
        yieldNet: yields.net,
        yieldNetNet: yields.netNet,
        avgCashflowMonthly: monthlyCashflow,
        totalTaxPaid: yearlyProjections.reduce((sum, y) => sum + y.incomeTax + y.socialTax, 0),
        totalInvestment,
        totalProfit,
        monthlyCashflow,
        totalAcquisitionCost
    };
}

/**
 * Calcule le TRI pour une période donnée avec revente automatique
 */
function calculateIRRForPeriod(input: SimulationInput, projections: YearlyProjection[], years: number): number {
    if (years <= 0 || projections.length === 0) return 0;

    const flows: number[] = [];

    // Flux initial : apport + frais
    flows.push(-(input.downPayment + input.notaryFees));

    // Limiter aux années disponibles
    const limitedYears = Math.min(years, projections.length);

    // Flux annuels
    for (let i = 0; i < limitedYears; i++) {
        flows.push(projections[i].cashflow);
    }

    // Ajouter la valeur de revente à la dernière année de la période
    if (limitedYears > 0 && limitedYears <= projections.length) {
        const lastProjection = projections[limitedYears - 1];
        const resaleValue = calculateResaleValue(input, lastProjection);
        flows[limitedYears] += resaleValue; // Ajouter au dernier flux
    }

    return calculateIRR(flows);
}

/**
 * Calcule les flux de trésorerie pour le TRI
 */
function calculateCashFlows(input: SimulationInput, projections: YearlyProjection[]): number[] {
    const flows: number[] = [];

    // Flux initial : apport + frais
    flows.push(-(input.downPayment + input.notaryFees));

    // Flux annuels
    for (const projection of projections) {
        flows.push(projection.cashflow);
    }

    // Flux de revente si applicable
    if (input.resaleYear > 0 && input.resaleYear <= projections.length) {
        const resaleProjection = projections[input.resaleYear - 1];
        const resaleValue = calculateResaleValue(input, resaleProjection);
        flows[input.resaleYear] += resaleValue; // Ajouter au flux de l'année de vente
    }

    return flows;
}

/**
 * Calcule la valeur nette de revente
 */
function calculateResaleValue(input: SimulationInput, projection: YearlyProjection): number {
    if (!projection || projection.propertyValue <= 0) return 0;

    const capitalGainsTax = calculateCapitalGainsTax(
        projection.propertyValue,
        input.price,
        input.notaryFees,
        projection.year
    );

    // Frais de vente estimés (agence + notaire vendeur) : ~8%
    const saleCosts = projection.propertyValue * 0.08;

    const netSalePrice = projection.propertyValue -
        capitalGainsTax.totalTax -
        projection.loanRemaining -
        saleCosts;

    // S'assurer qu'on ne retourne pas une valeur négative aberrante
    return Math.max(0, netSalePrice);
}

/**
 * Valide les données d'entrée
 */
export function validateSimulationInput(input: Partial<SimulationInput>): string[] {
    const errors: string[] = [];

    if (!input.propertyType) {
        errors.push("Type de bien requis");
    }

    if (!input.price || input.price <= 0) {
        errors.push("Prix d'achat requis et positif");
    }

    if (!input.rentMonthly || input.rentMonthly <= 0) {
        errors.push("Loyer mensuel requis et positif");
    }

    if (input.loanAmount && input.loanAmount > 0) {
        if (!input.interestRate || input.interestRate <= 0) {
            errors.push("Taux d'intérêt requis si prêt");
        }
        if (!input.loanDuration || input.loanDuration <= 0) {
            errors.push("Durée de prêt requise si prêt");
        }
    }

    if (!input.regime) {
        errors.push("Régime fiscal requis");
    }

    // Validation micro-foncier
    if (input.regime === 'micro-foncier' && input.rentMonthly) {
        const annualRent = input.rentMonthly * 12;
        if (annualRent > 15000) {
            errors.push("Loyers > 15k€ : micro-foncier non applicable");
        }
    }

    // Validation micro-BIC
    if (input.regime === 'micro-BIC' && input.rentMonthly) {
        const annualRent = input.rentMonthly * 12;
        const limit = input.propertyType === 'saisonnier' && !input.subOptions?.meubleTourismeClasse ?
            15000 : 77700;
        if (annualRent > limit) {
            errors.push(`Recettes > ${limit}€ : micro-BIC non applicable`);
        }
    }

    // Validation dispositifs
    if (input.regime === 'Pinel' && input.propertyType !== 'neuf') {
        errors.push("Pinel uniquement pour le neuf");
    }

    if ((input.regime === 'Denormandie' || input.regime === 'Malraux') &&
        input.propertyType !== 'ancien') {
        errors.push("Denormandie/Malraux uniquement pour l'ancien");
    }

    return errors;
} 