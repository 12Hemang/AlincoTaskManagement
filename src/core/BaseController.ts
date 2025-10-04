// controllers/BaseController.ts
export interface ActionState<T = any, A extends string | number = string> {
  action: A;        // Action identifier
  loading: boolean;  // Loading state
  error?: string;    // Error message
  data?: T | null; // allow null explicitly

}

export type ActionListener<T = any, A extends string | number = string> = (state: ActionState<T, A>) => void;

export abstract class BaseController<T = any, A extends string | number = string> {
  private listeners: ActionListener<T, A>[] = [];

  addListener(listener: ActionListener<T, A>) {
    this.listeners.push(listener);
  }

  protected notify(state: ActionState<T, A>) {
    this.listeners.forEach((l) => l(state));
  }
}
