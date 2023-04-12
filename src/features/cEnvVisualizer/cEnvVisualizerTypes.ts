import { BinaryWithOptionalType, ProgramType } from 'c-slang/dist/interpreter/typings';

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T;

type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>;

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export interface SnapshotOptions {
  rts: Array<BinaryWithOptionalType>;
  heap: Array<BinaryWithOptionalType>;
}

interface RecordDetailFunction {
  subtype: 'function';
  funcName: string;
  funcIndex: number;
}

interface RecordDetailStackPointer {
  subtype: 'stack_pointer';
  funcName: string;
  address: number;
}

interface RecordDetailVariable {
  subtype: 'variable';
  funcName: string;
  varName: string;
  varType: ProgramType;
  address: number;
}

export type RecordDetail = RecordDetailStackPointer | RecordDetailVariable | RecordDetailFunction;

export interface RecordDetailsMap {
  memory: Record<number, Array<RecordDetail>>;
  func: Record<number, RecordDetail>;
}
