import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

export interface FormValue {
  name: string;
  email: string;
  age: number;
  gender: string;
  termsConfirm: boolean;
}

interface FormState {
  formState: FormValue;
  undoStack: FormValue[];
  redoStack: FormValue[];
}

const initialState: FormState = {
  formState: { name: '', email: '', age: 0, gender: '', termsConfirm: false },
  undoStack: [],
  redoStack: []
}

export const FormStore = signalStore(
  withState(initialState),
  withComputed((state) => ({
    canUndo: computed(() => state.undoStack().length > 0),
    canRedo: computed(() => state.redoStack().length > 0),
    updatedForm: computed(() => state.formState()),
  })),
  withMethods((store) => ({
    updateForm(value: FormValue) {
      patchState(store, (state) => ({
        formState: value,
        redoStack: [],
        undoStack: [...state.undoStack, state.formState]
      }));
    },
    undo() {
      patchState(store, (state) => {
        if (state.undoStack.length > 0) {
          const newUndoStack = [...state.undoStack];
          const previousValue = newUndoStack.pop();
          return {
            undoStack: newUndoStack,
            redoStack: [...state.redoStack, state.formState],
            formState: previousValue!
          };
        }
        return state;
      });
    },
    redo() {
      patchState(store, (state) => {
        if (state.redoStack.length > 0) {
          const newRedoStack = [...state.redoStack];
          const nextValue = newRedoStack.pop();
          return {
            redoStack: newRedoStack,
            undoStack: [...state.undoStack, state.formState],
            formState: nextValue!
          };
        }
        return state;
      });
    },
    resetForm() {
      patchState(store, () => ({
        ...initialState
      }));
    }
  }))
);

