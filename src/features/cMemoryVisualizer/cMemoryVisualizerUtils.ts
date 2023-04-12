import { ProgramState } from 'c-slang/dist/interpreter/programState';
import {
  BinaryWithOptionalType,
  EScope,
  ProgramType,
  VariableScope
} from 'c-slang/dist/interpreter/typings';
import { decrementPointerDepth, getArrayItems } from 'c-slang/dist/interpreter/utils/typeUtils';
import {
  binaryToFormattedString,
  binaryToInt,
  intToBinary
} from 'c-slang/dist/interpreter/utils/utils';
import { Group } from 'konva/lib/Group';
import { Node } from 'konva/lib/Node';
import { Shape } from 'konva/lib/Shape';
import { cloneDeep, isFunction } from 'lodash';

import CMemoryVisualizer from './cMemoryVisualizer';
import { Config } from './cMemoryVisualizerConfig';
import {
  DeepReadonly,
  RecordDetail,
  RecordDetailsMap,
  SnapshotOptions
} from './cMemoryVisualizerTypes';

export const deepCopyState = (value: ProgramState): ProgramState => {
  const clone = cloneDeep(value);
  return clone;
};

export const createRecordDetailMap = (): RecordDetailsMap => {
  return { memory: {}, func: {} };
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
          if (map.memory[address] === undefined) map.memory[address] = [];
          map.memory[address].push({
            subtype: 'variable',
            funcName: name,
            varName: key,
            varType: record.variableType.map(x => {
              return { ...x };
            }) as ProgramType,
            address: address
          });
        } else if (record.subtype === 'func') {
          const funcIndex = record.funcIndex;
          map.func[funcIndex] = {
            subtype: 'function',
            funcName: key,
            funcIndex: funcIndex
          };
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

    if (map.memory[currentStackPointer] === undefined) map.memory[currentStackPointer] = [];
    map.memory[currentStackPointer].push({
      subtype: 'stack_pointer',
      funcName: envFuncNames[i],
      address: currentStackPointer
    });

    const entry = rtsSnapshot[currentStackPointer];
    currentStackPointer = binaryToInt(entry.binary);
    i--;
  }
};

export const setHoveredCursor = (target: Node | Group) => {
  const container = target.getStage()?.container();
  container && (container.style.cursor = 'pointer');
};

export const setUnhoveredCursor = (target: Node | Group) => {
  const container = target.getStage()?.container();
  container && (container.style.cursor = 'default');
};

/** Updates the styles of a Konva node and its children on hover, and then redraw the layer */
export const setHoveredStyle = (target: Node | Group, hoveredAttrs: any = {}): void => {
  const nodes: (Group | Shape | Node)[] =
    target instanceof Group ? Array.from(target.children || []) : [];
  nodes.push(target);
  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke ? Config.HoveredColor.toString() : node.attrs.stroke,
      fill: node.attrs.fill ? Config.HoveredColor.toString() : node.attrs.fill,
      ...hoveredAttrs
    });
  });
};

/** Updates the styles of a Konva node and its children on unhover, and then redraw the layer */
export const setUnhoveredStyle = (target: Node | Group, unhoveredAttrs: any = {}): void => {
  const nodes: (Group | Shape | Node)[] =
    target instanceof Group ? Array.from(target.children || []) : [];
  nodes.push(target);

  nodes.forEach(node => {
    node.setAttrs({
      stroke: node.attrs.stroke
        ? CMemoryVisualizer.getPrintableMode()
          ? Config.SA_BLUE.toString()
          : Config.SA_WHITE.toString()
        : node.attrs.stroke,
      fill: node.attrs.fill
        ? CMemoryVisualizer.getPrintableMode()
          ? Config.SA_BLUE.toString()
          : Config.SA_WHITE.toString()
        : node.attrs.fill,
      ...unhoveredAttrs
    });
  });
};

export const getTypeExplanation = (type: DeepReadonly<ProgramType>) => {
  const explanation: string[] = [];
  type.forEach((x, i) => {
    if (x.subtype === 'BaseType') {
      const baseType: string = (() => {
        switch (x.baseType) {
          case 'char':
            return 'Character';
          case 'float':
            return 'Float';
          case 'int':
            return 'Integer';
          case 'void':
            return 'Void';
        }
      })();
      explanation.push(baseType);
    } else if (x.subtype === 'Array') {
      explanation.push(`Array of ${x.size}`);
    } else if (x.subtype === 'Parameters') {
      // const functionString = x.parameterTypeList.map(x => x.paramType.typeModifiers);
      explanation.push('Function returning');
    } else if (x.subtype === 'Pointer') {
      explanation.push(`Pointer to`);
    }
  });
  return explanation.join(' ');
};

export const isArray = (type: DeepReadonly<ProgramType>): boolean => {
  if (type.length === 0) return false;
  return type[0].subtype === 'Array';
};

export const isPointer = (type: DeepReadonly<ProgramType>): boolean => {
  if (type.length === 0) return false;
  return type[0].subtype === 'Pointer';
};

const getValueByAddressFromSnapshotOptions = (
  address: number,
  snapshotOptions: DeepReadonly<SnapshotOptions>
): DeepReadonly<BinaryWithOptionalType> | undefined => {
  if (address < snapshotOptions.rts.length) {
    return snapshotOptions.rts[address];
  } else if (address in snapshotOptions.heap) {
    return snapshotOptions.heap[address];
  }
  return undefined;
};

export const getToolTipMessageForValue = (
  binary: BinaryWithOptionalType,
  snapshotOptions: DeepReadonly<SnapshotOptions>,
  map: RecordDetailsMap
) => {
  const intValue = binaryToInt(binary.binary);
  if (binary.type === undefined || binary.type.length === 0) return `unknown ${intValue}`;

  const firstType = binary.type[0].subtype;
  switch (firstType) {
    case 'BaseType':
      return binaryToFormattedString(binary.binary, binary.type);
    case 'Pointer': {
      const pointerType = decrementPointerDepth(binary.type);
      if (pointerType.length === 0) return `pointer ${intValue}`;
      switch (pointerType[0].subtype) {
        case 'Parameters': {
          const functionDef = map.func[intValue];
          if (functionDef === undefined) return `pointer to unknown function`;
          return `pointer to function ${functionDef.funcName}`;
        }
        case 'Array': {
          const items = getArrayItems(
            { binary: binary.binary, type: pointerType },
            (address: number) =>
              getValueByAddressFromSnapshotOptions(
                address,
                snapshotOptions
              ) as BinaryWithOptionalType
          );
          const itemsString = items.map(x => {
            if (x === undefined) return 'Garbage Value';
            return binaryToFormattedString(x.binary, x.type);
          });
          return `pointer to array of [${itemsString.join(', ')}]`;
        }
        case 'BaseType':
        case 'Pointer': {
          const value = getValueByAddressFromSnapshotOptions(intValue, snapshotOptions);
          if (value === undefined) return `pointer to garbage value`;
          return `pointer to ${binaryToFormattedString(value.binary, value.type as ProgramType)}`;
        }
      }
      break;
    }
    default:
      return '';
  }
};

export const getTooltipMessageForReference = (
  detail: DeepReadonly<RecordDetail>,
  snapshotOptions: DeepReadonly<SnapshotOptions>,
  map: RecordDetailsMap
): string => {
  if (detail.subtype === 'stack_pointer') {
    return `Stack pointer for function ${detail.funcName}`;
  }
  if (detail.subtype === 'variable') {
    let retString = `Variable ${detail.varName} for function ${detail.funcName}`;
    retString += `\nType: ${getTypeExplanation(detail.varType)}`;
    if (isPointer(detail.varType)) {
      const pointer = getValueByAddressFromSnapshotOptions(detail.address, snapshotOptions);
      if (pointer !== undefined) {
        const pointerValue = binaryToInt(pointer.binary);
        const newType = decrementPointerDepth(detail.varType as ProgramType);
        if (isFunction(newType)) {
          const funcRecord = map.func[pointerValue];
          if (funcRecord !== undefined) {
            retString += `\nValue: Pointer to function ${funcRecord.funcName}`;
          }
        } else {
          if (pointerValue !== undefined) {
            const actual = getValueByAddressFromSnapshotOptions(pointerValue, snapshotOptions);
            if (actual) {
              const actualType: ProgramType | undefined = actual.type
                ? ([
                    ...actual.type.map(x => {
                      return { ...x };
                    })
                  ] as ProgramType)
                : undefined;
              retString += `\nDereferenced Value: ${binaryToFormattedString(
                actual.binary,
                actualType as ProgramType
              )}`;
            } else {
              retString += '\nDereferenced Value: Garbage Value';
            }
          }
        }
      }
    }
    if (isArray(detail.varType) && detail.varType[0].subtype === 'Array') {
      const items = getArrayItems(
        { binary: intToBinary(detail.address), type: detail.varType as ProgramType },
        (address: number) =>
          getValueByAddressFromSnapshotOptions(address, snapshotOptions) as BinaryWithOptionalType
      );
      const itemsString = items.map(x => {
        if (x === undefined) return 'Garbage Value';
        return binaryToFormattedString(x.binary, x.type);
      });
      retString += `\nArray Value: [${itemsString.join(', ')}]`;
    }
    return retString;
  }
  return '';
};
