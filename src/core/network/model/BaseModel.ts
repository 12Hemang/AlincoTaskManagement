// domain/models/BaseModel.ts
export abstract class BaseModel<T> {
  // Optional: override in child model
  static fromJson(json: any): any {
    return json; // default: raw JSON
  }

  toJson(): any {
    return { ...this }; // default: shallow copy
  }
}
