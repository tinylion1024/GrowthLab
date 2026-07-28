import { create } from 'zustand'
import type { SaveState } from '../../components/types'
import type { GrowthExperiment } from '../../types'

interface ExperimentStore {
  experiments: GrowthExperiment[]
  activeId: string | null
  view: 'home' | 'editor'
  saveState: SaveState
  hydrate: (experiments: GrowthExperiment[]) => void
  setExperiments: (experiments: GrowthExperiment[]) => void
  openExperiment: (id: string) => void
  goHome: () => void
  updateExperiment: (experiment: GrowthExperiment) => void
  setSaveState: (saveState: SaveState) => void
}

export const useExperimentStore = create<ExperimentStore>((set) => ({
  experiments: [],
  activeId: null,
  view: 'home',
  saveState: 'saved',
  hydrate: (experiments) => set({ experiments, saveState: 'saved' }),
  setExperiments: (experiments) => set({ experiments }),
  openExperiment: (activeId) => set({ activeId, view: 'editor' }),
  goHome: () => set({ activeId: null, view: 'home' }),
  updateExperiment: (experiment) => set((state) => ({
    experiments: state.experiments.some((item) => item.id === experiment.id)
      ? state.experiments.map((item) => item.id === experiment.id ? experiment : item)
      : [experiment, ...state.experiments],
    saveState: 'dirty',
  })),
  setSaveState: (saveState) => set({ saveState }),
}))

