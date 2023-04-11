import { ProgramState } from 'c-slang/dist/interpreter/programState';
import {
  BinaryWithOptionalType,
  EScope,
  ProgramType,
  VariableScope
} from 'c-slang/dist/interpreter/typings';
import { binaryToInt } from 'c-slang/dist/interpreter/utils/utils';
import { cloneDeep } from 'lodash';

import { DeepReadonly } from './cEnvVisualizerTypes';

export const deepCopyState = (value: ProgramState): ProgramState => {
  const clone = cloneDeep(value);
  return clone;
};

interface RecordDetailStackPointer {
  subtype: 'stack_pointer';
  funcName: string;
}

interface RecordDetailVariable {
  subtype: 'variable';
  funcName: string;
  varName: string;
  varType: ProgramType;
}

export type RecordDetail = RecordDetailStackPointer | RecordDetailVariable;

export type RecordDetailsMap = Record<number, Array<RecordDetail>>;

export const createRecordDetailMap = () => {
  return {} as RecordDetailsMap;
};

export const populateRecordDetailMapWithEnv = (
  map: RecordDetailsMap,
  env: DeepReadonly<Array<EScope>>
) => {
  env.forEach(e => {
    const name = e.name;
    let currentScope: DeepReadonly<VariableScope> | undefined = e.varScope;
    while (currentScope !== undefined) {
      const records = currentScope.record;
      const keys = Object.keys(records);
      keys.forEach(key => {
        const record = records[key];
        if (record.subtype === 'variable') {
          const address = record.address;
          if (map[address] === undefined) map[address] = [];
          map[address].push({
            subtype: 'variable',
            funcName: name,
            varName: key,
            varType: record.variableType.map(x => {
              return { ...x };
            }) as ProgramType
          });
        }
      });

      currentScope = currentScope.parent;
    }
  });
};

export const populateRecordDetailMapWithStackPointer = (
  map: RecordDetailsMap,
  rtsStart: number,
  rtsSnapshot: DeepReadonly<Record<number, BinaryWithOptionalType>>,
  env: DeepReadonly<Array<EScope>>
) => {
  const envFuncNames: Array<string> = env.map(x => x.name);
  let currentStackPointer = rtsStart;
  let i = envFuncNames.length - 1;
  while (true) {
    if (currentStackPointer === -1) {
      break;
    }

    if (map[currentStackPointer] === undefined) map[currentStackPointer] = [];
    map[currentStackPointer].push({ subtype: 'stack_pointer', funcName: envFuncNames[i] });

    const entry = rtsSnapshot[currentStackPointer];
    currentStackPointer = binaryToInt(entry.binary);
    i--;
  }
};
