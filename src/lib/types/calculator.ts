export type LocationType = 'nue' | 'meublee';
export type RegimeFiscal = 'micro' | 'reel';
export type StatusLoueur = 'lmnp' | 'lmp';
export type Dispositif = 'aucun' | 'pinel' | 'denormandie' | 'malraux';
export type TypeBien = 'ancien' | 'neuf';
export type ClasseDPE = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface ParametresInvestissement {
    // Acquisition
    prixAchat: number;
    fraisNotaire: number;
    fraisAgence: number;
    travaux: number;
    apportPersonnel: number;

    // Financement
    montantPret: number;
    dureePret: number; // en années
    tauxPret: number; // taux annuel en %
    assuranceEmprunteur: number; // en %

    // Bien immobilier
    surface: number;
    typeBien: TypeBien;
    classeDPE: ClasseDPE;

    // Revenus locatifs
    loyerMensuel: number;
    chargesRecuperables: number;
    vacanceLocative: number; // en %

    // Charges annuelles
    chargesCopropriete: number;
    fraisEntretienGestion: number;
    assuranceHabitation: number;
    taxeFonciere: number;

    // Fiscalité
    locationType: LocationType;
    regimeFiscal: RegimeFiscal;
    statusLoueur?: StatusLoueur;
    dispositif: Dispositif;
    trancheMarginalImposition: number; // en %

    // Projections
    dureeProjection: number; // en années
    tauxInflationLoyers: number; // en %
    tauxInflationCharges: number; // en %
    tauxAppreciationBien: number; // en %

    // Pinel/Denormandie
    dureePinel?: 6 | 9 | 12;
    anneePinel?: number;

    // Malraux
    montantTravauxMalraux?: number;
    zoneMalraux?: 'secteur_sauvegarde' | 'autre';
}

export interface ResultatsAnnuels {
    annee: number;
    loyersBruts: number;
    loyersNets: number;
    chargesAnnuelles: number;
    interetsPayes: number;
    capitalRembourse: number;
    capitalRestantDu: number;
    amortissement: number;
    revenuImposable: number;
    impotIR: number;
    prelevementsSociaux: number;
    reductionImpot: number;
    cashFlowAvantImpot: number;
    cashFlowApresImpot: number;
    cashFlowCumule: number;
    valeurBien: number;
}

export interface IndicateursRentabilite {
    rentabiliteBrute: number;
    rentabiliteNette: number;
    rentabiliteNetteNette: number;
    cashFlowMensuel: number;
    cashFlowAnnuel: number;
    tri: number;
    roi: number;
    totalImpots: number;
    totalReductions: number;
    plusValueBrute: number;
    plusValueNette: number;
    prixRevente: number;
    impotPlusValue: number;
    gainTotal: number;
    resultatProjection: ResultatsAnnuels[];
}

export interface TableauAmortissement {
    periode: number;
    mensualite: number;
    interets: number;
    capital: number;
    capitalRestant: number;
}

export interface ConfigurationPinel {
    tauxReduction: number;
    repartition: number[];
}

export interface ConfigurationMalraux {
    tauxReduction: number;
    plafondTravaux: number;
} 