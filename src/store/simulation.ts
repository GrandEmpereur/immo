import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SimulationInput } from '@/schemas/simulation';

interface SimulationState {
    // État du formulaire
    currentStep: number;
    isLoading: boolean;

    // Données de la simulation
    data: Partial<SimulationInput>;

    // Actions
    setCurrentStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    updateData: (data: Partial<SimulationInput>) => void;
    resetSimulation: () => void;
    setLoading: (loading: boolean) => void;
}

const initialData: Partial<SimulationInput> = {
    // Valeurs par défaut intelligentes
    propertyType: undefined,
    price: 0,
    notaryFees: 0,
    surface: 0,
    downPayment: 0,
    loanAmount: 0,
    interestRate: 3.5, // Taux par défaut
    loanDuration: 20,   // Durée par défaut
    insuranceRate: 0.2, // Assurance par défaut
    rentMonthly: 0,
    chargesRecoverableMonthly: 0,
    // Charges non récupérables séparées
    propertyTaxMonthly: 0,
    condoFeesMonthly: 0,
    managementFeesMonthly: 0,
    insuranceMonthly: 0,
    otherExpensesMonthly: 0,
    vacancyRate: 8, // 1 mois de vacance par défaut
    regime: undefined,
    taxpayerTMI: 30, // TMI par défaut pour investisseurs
    resaleYear: 20,
    appreciationRate: 2, // 2% d'appréciation par défaut
};

export const useSimulationStore = create<SimulationState>()(
    persist(
        (set, get) => ({
            currentStep: 1,
            isLoading: false,
            data: initialData,

            setCurrentStep: (step: number) => set({ currentStep: step }),

            nextStep: () => set((state) => ({
                currentStep: Math.min(state.currentStep + 1, 6) // 6 étapes max
            })),

            prevStep: () => set((state) => ({
                currentStep: Math.max(state.currentStep - 1, 1)
            })),

            updateData: (newData: Partial<SimulationInput>) => set((state) => {
                const updatedData = { ...state.data, ...newData };

                // Logique de calcul automatique
                if (newData.price !== undefined || newData.notaryFees !== undefined || newData.downPayment !== undefined) {
                    const price = newData.price ?? state.data.price ?? 0;
                    const notaryFees = newData.notaryFees ?? state.data.notaryFees ?? 0;
                    const downPayment = newData.downPayment ?? state.data.downPayment ?? 0;

                    // Calcul automatique du prêt
                    updatedData.loanAmount = Math.max(0, price + notaryFees - downPayment);

                    // Calcul automatique des frais de notaire si pas définis
                    if (newData.price !== undefined && !newData.notaryFees) {
                        const propertyType = state.data.propertyType;
                        if (propertyType === 'neuf') {
                            updatedData.notaryFees = price * 0.025; // 2.5% pour le neuf
                        } else if (propertyType === 'ancien') {
                            updatedData.notaryFees = price * 0.075; // 7.5% pour l'ancien
                        }
                    }
                }

                return { data: updatedData };
            }),

            resetSimulation: () => set({
                currentStep: 1,
                data: initialData,
                isLoading: false
            }),

            setLoading: (loading: boolean) => set({ isLoading: loading }),
        }),
        {
            name: 'immo-simulation',
            partialize: (state) => ({
                data: state.data,
                currentStep: state.currentStep
            }),
        }
    )
); 