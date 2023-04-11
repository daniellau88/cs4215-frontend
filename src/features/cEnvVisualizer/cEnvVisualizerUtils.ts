import { ProgramState } from 'c-slang/dist/interpreter/programState';
import { cloneDeep } from 'lodash';

export function deepCopyState(value: ProgramState): ProgramState {
  const clone = cloneDeep(value);
  return clone;
}
