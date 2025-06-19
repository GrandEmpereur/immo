import { create } from 'zustand';
import { SimulationResult } from '@/schemas/simulation';

interface ResultsState {
    results: SimulationResult | null;
    isCalculating: boolean;
    error: string | null;

    // Actions
    setResults: (results: SimulationResult) => void;
    setCalculating: (calculating: boolean) => void;
    setError: (error: string | null) => void;
    clearResults: () => void;
}

export const useResultsStore = create<ResultsState>((set) => ({
    results: null,
    isCalculating: false,
    error: null,

    setResults: (results: SimulationResult) => set({
        results,
        isCalculating: false,
        error: null
    }),

    setCalculating: (calculating: boolean) => set({
        isCalculating: calculating,
        error: null
    }),

    setError: (error: string | null) => set({
        error,
        isCalculating: false
    }),

    clearResults: () => set({
        results: null,
        isCalculating: false,
        error: null
    }),
})); 