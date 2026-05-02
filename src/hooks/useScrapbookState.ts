import { useCallback, useMemo, useReducer } from 'react';
import type { ScrapObject } from '../types/scrapbook';
import { initialObjects } from '../constants';

type HistoryState = {
  objects: ScrapObject[];
  past: ScrapObject[][];
  future: ScrapObject[][];
};

function snap(objects: ScrapObject[]): ScrapObject[] {
  return JSON.parse(JSON.stringify(objects)) as ScrapObject[];
}

const initial: HistoryState = {
  objects: initialObjects(),
  past: [],
  future: [],
};

type Action =
  | { type: 'set'; objects: ScrapObject[]; record: boolean }
  | { type: 'update'; updater: (prev: ScrapObject[]) => ScrapObject[] }
  | { type: 'updateSilent'; updater: (prev: ScrapObject[]) => ScrapObject[] }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'hydrate'; objects: ScrapObject[] }
  | { type: 'commitSilent'; before: ScrapObject[] };

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case 'hydrate':
      return { objects: action.objects, past: [], future: [] };
    case 'commitSilent':
      return {
        ...state,
        past: [...state.past, action.before].slice(-50),
        future: [],
      };
    case 'set': {
      if (!action.record) {
        return { ...state, objects: action.objects };
      }
      return {
        objects: action.objects,
        past: [...state.past, snap(state.objects)].slice(-50),
        future: [],
      };
    }
    case 'update': {
      const next = action.updater(state.objects);
      return {
        objects: next,
        past: [...state.past, snap(state.objects)].slice(-50),
        future: [],
      };
    }
    case 'updateSilent': {
      return {
        ...state,
        objects: action.updater(state.objects),
      };
    }
    case 'undo':
      if (state.past.length === 0) return state;
      return {
        objects: state.past[state.past.length - 1],
        past: state.past.slice(0, -1),
        future: [snap(state.objects), ...state.future].slice(0, 50),
      };
    case 'redo':
      if (state.future.length === 0) return state;
      return {
        objects: state.future[0],
        past: [...state.past, snap(state.objects)].slice(-50),
        future: state.future.slice(1),
      };
    default:
      return state;
  }
}

export function useScrapbookState() {
  const [state, dispatch] = useReducer(reducer, initial);

  const setObjects = useCallback((objects: ScrapObject[], record = true) => {
    dispatch({ type: 'set', objects, record });
  }, []);

  const updateObjects = useCallback((updater: (prev: ScrapObject[]) => ScrapObject[]) => {
    dispatch({ type: 'update', updater });
  }, []);

  const replaceSilent = useCallback((objects: ScrapObject[]) => {
    dispatch({ type: 'set', objects, record: false });
  }, []);

  const patchObjectSilent = useCallback((id: string, patch: Partial<ScrapObject>) => {
    dispatch({
      type: 'updateSilent',
      updater: (prev) => prev.map((o) => (o.id === id ? ({ ...o, ...patch } as ScrapObject) : o)),
    });
  }, []);

  const commitAfterSilentGesture = useCallback((before: ScrapObject[]) => {
    dispatch({ type: 'commitSilent', before });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);

  const patchObject = useCallback(
    (id: string, patch: Partial<ScrapObject>) => {
      dispatch({
        type: 'update',
        updater: (prev) => prev.map((o) => (o.id === id ? ({ ...o, ...patch } as ScrapObject) : o)),
      });
    },
    [],
  );

  const api = useMemo(
    () => ({
      objects: state.objects,
      setObjects,
      updateObjects,
      replaceSilent,
      patchObjectSilent,
      commitAfterSilentGesture,
      patchObject,
      undo,
      redo,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [
      state.objects,
      state.past.length,
      state.future.length,
      setObjects,
      updateObjects,
      replaceSilent,
      patchObjectSilent,
      commitAfterSilentGesture,
      patchObject,
      undo,
      redo,
    ],
  );

  return api;
}
