import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { SimulationResult } from '@/schemas/simulation';

/**
 * Génère et télécharge un rapport PDF de la simulation
 */
export function exportToPDF(results: SimulationResult) {
    const doc = new jsPDF();

    // Configuration
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 6;
    let yPosition = 30;

    // En-tête
    doc.setFontSize(20);
    doc.text('RAPPORT D\'ANALYSE RENTABILITÉ IMMOBILIÈRE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Date de génération : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Hypothèses de simulation
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('HYPOTHÈSES DE SIMULATION', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const assumptions = [
        ['Type de bien', results.assumptions.propertyType === 'neuf' ? 'Neuf' :
            results.assumptions.propertyType === 'ancien' ? 'Ancien' : 'Saisonnier'],
        ['Prix d\'achat', `${results.assumptions.price.toLocaleString('fr-FR')} €`],
        ['Régime fiscal', results.assumptions.regime],
        ['Loyer mensuel', `${results.assumptions.rentMonthly.toLocaleString('fr-FR')} €`],
        ['Taux de vacance', `${results.assumptions.vacancyRate}%`],
        ['TMI', `${results.assumptions.taxpayerTMI}%`],
    ];

    assumptions.forEach(([label, value]) => {
        doc.text(`${label} :`, margin, yPosition);
        doc.text(value, margin + 60, yPosition);
        yPosition += lineHeight;
    });

    yPosition += 10;

    // Synthèse des indicateurs
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INDICATEURS DE PERFORMANCE', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const indicators = [
        ['Rentabilité brute', `${results.yieldGross.toFixed(2)}%`],
        ['Rentabilité nette', `${results.yieldNet.toFixed(2)}%`],
        ['Rentabilité net-net', `${results.yieldNetNet.toFixed(2)}%`],
        ['Cash-flow mensuel moyen', `${results.avgCashflowMonthly >= 0 ? '+' : ''}${results.avgCashflowMonthly.toFixed(0)} €`],
        ['ROI total', `${results.roi.toFixed(1)}%`],
        ['TRI 10 ans', `${results.irr.year10.toFixed(2)}%`],
        ['TRI 20 ans', `${results.irr.year20.toFixed(2)}%`],
        ['TRI 30 ans', `${results.irr.year30.toFixed(2)}%`],
        ['Retour sur investissement', results.paybackYear ? `${results.paybackYear} ans` : 'Non atteint'],
    ];

    indicators.forEach(([label, value]) => {
        doc.text(`${label} :`, margin, yPosition);
        doc.text(value, margin + 80, yPosition);
        yPosition += lineHeight;
    });

    yPosition += 10;

    // Synthèse financière
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SYNTHÈSE FINANCIÈRE', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const financial = [
        ['Investissement total', `${results.totalInvestment.toLocaleString('fr-FR')} €`],
        ['Profit total projeté', `${results.totalProfit.toLocaleString('fr-FR')} €`],
        ['Total impôts payés', `${results.totalTaxPaid.toLocaleString('fr-FR')} €`],
        ['Coût total d\'acquisition', `${results.totalAcquisitionCost.toLocaleString('fr-FR')} €`],
    ];

    financial.forEach(([label, value]) => {
        doc.text(`${label} :`, margin, yPosition);
        doc.text(value, margin + 80, yPosition);
        yPosition += lineHeight;
    });

    // Nouvelle page pour le détail annuel
    doc.addPage();
    yPosition = 30;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECTION ANNUELLE', margin, yPosition);
    yPosition += 15;

    // En-têtes du tableau
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const headers = ['Année', 'Loyers', 'Charges', 'Cash-flow', 'Impôt', 'Valeur bien'];
    const colWidths = [20, 25, 25, 25, 25, 30];
    let xPos = margin;

    headers.forEach((header, i) => {
        doc.text(header, xPos, yPosition);
        xPos += colWidths[i];
    });
    yPosition += 8;

    // Ligne de séparation
    doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);

    // Données annuelles (première 10 années)
    doc.setFont('helvetica', 'normal');
    const firstTenYears = results.yearlyProjections.slice(0, 10);

    firstTenYears.forEach(year => {
        if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 30;
        }

        xPos = margin;
        const rowData = [
            year.year.toString(),
            `${Math.round(year.rentEffective).toLocaleString('fr-FR')}`,
            `${Math.round(year.expenses).toLocaleString('fr-FR')}`,
            `${Math.round(year.cashflow).toLocaleString('fr-FR')}`,
            `${Math.round(year.incomeTax + year.socialTax).toLocaleString('fr-FR')}`,
            `${Math.round(year.propertyValue).toLocaleString('fr-FR')}`,
        ];

        rowData.forEach((data, i) => {
            doc.text(data, xPos, yPosition);
            xPos += colWidths[i];
        });
        yPosition += lineHeight;
    });

    // Avertissements et conformité
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AVERTISSEMENT LÉGAL', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const warnings = [
        'Ces calculs sont basés sur la législation fiscale française en vigueur en 2025.',
        'Les résultats sont indicatifs et ne constituent pas un conseil en investissement.',
        'Les performances passées ne préjugent pas des performances futures.',
        'Il est recommandé de consulter un expert comptable ou un CGPI.',
    ];

    warnings.forEach(warning => {
        const splitWarning = doc.splitTextToSize(warning, pageWidth - 2 * margin);
        doc.text(splitWarning, margin, yPosition);
        yPosition += splitWarning.length * lineHeight;
    });

    // Contraintes DPE si applicable
    if (results.assumptions.dpeClass && ['F', 'G', 'E'].includes(results.assumptions.dpeClass)) {
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('⚠️ CONTRAINTES DPE', margin, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        let dpeWarning = '';
        if (results.assumptions.dpeClass === 'G') {
            dpeWarning = 'DPE G : Location interdite depuis 2025. Rénovation énergétique obligatoire.';
        } else if (results.assumptions.dpeClass === 'F') {
            dpeWarning = 'DPE F : Location interdite dès 2028. Prévoyez des travaux de rénovation.';
        } else if (results.assumptions.dpeClass === 'E') {
            dpeWarning = 'DPE E : Location interdite dès 2034. Anticipez les travaux énergétiques.';
        }

        const splitDpeWarning = doc.splitTextToSize(dpeWarning, pageWidth - 2 * margin);
        doc.text(splitDpeWarning, margin, yPosition);
    }

    // Téléchargement
    const fileName = `analyse-rentabilite-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
}

/**
 * Génère et télécharge un fichier Excel avec les données de simulation
 */
export function exportToExcel(results: SimulationResult) {
    // Création du classeur
    const workbook = XLSX.utils.book_new();

    // Feuille 1 : Synthèse
    const summaryData = [
        ['ANALYSE RENTABILITÉ IMMOBILIÈRE'],
        [''],
        ['Date de génération', new Date().toLocaleDateString('fr-FR')],
        [''],
        ['HYPOTHÈSES'],
        ['Type de bien', results.assumptions.propertyType],
        ['Prix d\'achat', results.assumptions.price],
        ['Régime fiscal', results.assumptions.regime],
        ['Loyer mensuel', results.assumptions.rentMonthly],
        ['Taux de vacance (%)', results.assumptions.vacancyRate],
        ['TMI (%)', results.assumptions.taxpayerTMI],
        [''],
        ['INDICATEURS DE PERFORMANCE'],
        ['Rentabilité brute (%)', parseFloat(results.yieldGross.toFixed(2))],
        ['Rentabilité nette (%)', parseFloat(results.yieldNet.toFixed(2))],
        ['Rentabilité net-net (%)', parseFloat(results.yieldNetNet.toFixed(2))],
        ['Cash-flow mensuel moyen (€)', parseFloat(results.avgCashflowMonthly.toFixed(0))],
        ['ROI total (%)', parseFloat(results.roi.toFixed(1))],
        ['TRI 10 ans (%)', parseFloat(results.irr.year10.toFixed(2))],
        ['TRI 20 ans (%)', parseFloat(results.irr.year20.toFixed(2))],
        ['TRI 30 ans (%)', parseFloat(results.irr.year30.toFixed(2))],
        ['Retour sur investissement (années)', results.paybackYear || 'Non atteint'],
        [''],
        ['SYNTHÈSE FINANCIÈRE'],
        ['Investissement total (€)', results.totalInvestment],
        ['Profit total projeté (€)', results.totalProfit],
        ['Total impôts payés (€)', results.totalTaxPaid],
        ['Coût total d\'acquisition (€)', results.totalAcquisitionCost],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Synthèse');

    // Feuille 2 : Projection annuelle
    const projectionHeaders = [
        'Année',
        'Loyers bruts (€)',
        'Loyers effectifs (€)',
        'Charges (€)',
        'Intérêts payés (€)',
        'Capital remboursé (€)',
        'Revenus imposables (€)',
        'Impôt sur le revenu (€)',
        'Prélèvements sociaux (€)',
        'Cash-flow (€)',
        'Cash-flow cumulé (€)',
        'Capital restant dû (€)',
        'Valeur du bien (€)',
        'Plus-value potentielle (€)'
    ];

    const projectionData = results.yearlyProjections.map(year => [
        year.year,
        Math.round(year.rentGross),
        Math.round(year.rentEffective),
        Math.round(year.expenses),
        Math.round(year.interestPaid),
        Math.round(year.principalPaid),
        Math.round(year.taxableIncome),
        Math.round(year.incomeTax),
        Math.round(year.socialTax),
        Math.round(year.cashflow),
        Math.round(year.cumulatedCashflow),
        Math.round(year.loanRemaining),
        Math.round(year.propertyValue),
        Math.round(year.potentialCapitalGain)
    ]);

    const projectionSheet = XLSX.utils.aoa_to_sheet([projectionHeaders, ...projectionData]);
    XLSX.utils.book_append_sheet(workbook, projectionSheet, 'Projection annuelle');

    // Feuille 3 : Notes et conformité
    const notesData = [
        ['NOTES ET CONFORMITÉ RÉGLEMENTAIRE'],
        [''],
        ['Avertissement légal'],
        ['Ces calculs sont basés sur la législation fiscale française en vigueur en 2025.'],
        ['Les résultats sont indicatifs et ne constituent pas un conseil en investissement.'],
        ['Les performances passées ne préjugent pas des performances futures.'],
        ['Il est recommandé de consulter un expert comptable ou un CGPI.'],
        [''],
        ['Conformité 2025'],
        ['Micro-foncier : plafond 15 000€ de revenus annuels'],
        ['Micro-BIC : plafond 77 700€ (15 000€ pour locations saisonnières non classées)'],
        ['DPE G : interdiction de location depuis 2025'],
        ['DPE F : interdiction de location dès 2028'],
        ['DPE E : interdiction de location dès 2034'],
    ];

    // Ajouter contraintes DPE spécifiques si applicable
    if (results.assumptions.dpeClass && ['F', 'G', 'E'].includes(results.assumptions.dpeClass)) {
        notesData.push(['']);
        notesData.push(['⚠️ ATTENTION DPE']);
        if (results.assumptions.dpeClass === 'G') {
            notesData.push(['Votre bien est classé G : location interdite depuis 2025']);
        } else if (results.assumptions.dpeClass === 'F') {
            notesData.push(['Votre bien est classé F : location interdite dès 2028']);
        } else if (results.assumptions.dpeClass === 'E') {
            notesData.push(['Votre bien est classé E : location interdite dès 2034']);
        }
        notesData.push(['Rénovation énergétique obligatoire pour continuer à louer']);
    }

    const notesSheet = XLSX.utils.aoa_to_sheet(notesData);
    XLSX.utils.book_append_sheet(workbook, notesSheet, 'Notes');

    // Téléchargement
    const fileName = `analyse-rentabilite-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
} 