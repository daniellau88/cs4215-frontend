/* tslint:disable: ban-types*/
import createSlangContext from 'c-slang/dist/createContext';
import { BinaryWithType } from 'c-slang/dist/interpreter/typings';
import { binaryToFormattedString } from 'c-slang/dist/interpreter/utils/utils';
import { Context, Variant } from 'c-slang/dist/types';
import { difference, keys } from 'lodash';
import EnvVisualizer from 'src/features/envVisualizer/EnvVisualizer';

import DisplayBufferService from './DisplayBufferService';

/**
 * This file contains wrappers for certain functions
 * in the @source-academy/slang module.
 *
 * Use this file especially when attempting to create a slang Context.
 */

function printfLog(workspaceLocation: any, args: Array<BinaryWithType>) {
  args.forEach(x => {
    const output = binaryToFormattedString(x.binary, x.type)
    DisplayBufferService.push(output, workspaceLocation)
  })
}

export function visualizeEnv({ context }: { context: Context }) {
  try {
    EnvVisualizer.drawEnv(context);
  } catch (err) {
    throw new Error('Env visualizer is not enabled');
  }
}

export function highlightClean() {
  if ((window as any).Inspector) {
    (window as any).Inspector.highlightClean();
  } else {
    throw new Error('Inspector not loaded');
  }
}

export function highlightLine(line: number) {
  if ((window as any).Inspector) {
    (window as any).Inspector.highlightLine(line);
  } else {
    throw new Error('Inspector not loaded');
  }
}

export const externalBuiltIns = {
  printfLog
};

/**
 * A wrapper around c-slang's createContext. This
 * provides the original function with the required
 * externalBuiltIns, such as display and prompt.
 */
export function createContext<T>(
  externals: string[],
  externalContext: T,
  variant: Variant = Variant.DEFAULT
) {
  return createSlangContext<T>(variant, externals, externalContext, externalBuiltIns);
}


// Given a Context, returns a privileged Context that when referenced,
// intercepts reads from the underlying Context and returns desired values
export function makeElevatedContext(context: Context) {
  function ProxyFrame() {}
  ProxyFrame.prototype = context.runtime.environments[0].head;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fakeFrame: { [key: string]: any } = new ProxyFrame();
  // Explanation: Proxy doesn't work for defineProperty in use-strict.
  // The c-slang will defineProperty on loadStandardLibraries
  // Creating a raw JS object and setting prototype will allow defineProperty on the child
  // while reflection should work on parent.

  const proxyGlobalEnv = new Proxy(context.runtime.environments[0], {
    get(target, prop: string | symbol, receiver) {
      if (prop === 'head') {
        return fakeFrame;
      }
      return target[prop];
    }
  });

  const proxyEnvs = new Proxy(context.runtime.environments, {
    get(target, prop, receiver) {
      if (prop === '0') {
        return proxyGlobalEnv;
      }
      return target[prop];
    }
  });

  const proxyRuntime = new Proxy(context.runtime, {
    get(target, prop, receiver) {
      if (prop === 'environments') {
        return proxyEnvs;
      }
      return target[prop];
    }
  });

  const elevatedContext = new Proxy(context, {
    get(target, prop, receiver) {
      switch (prop) {
        case 'chapter':
          return 4;
        case 'runtime':
          return proxyRuntime;
        default:
          return target[prop];
      }
    }
  });

  return elevatedContext;
}

export function getDifferenceInMethods(elevatedContext: Context, context: Context) {
  const eFrame = elevatedContext.runtime.environments[0].head;
  const frame = context.runtime.environments[0].head;
  return difference(keys(eFrame), keys(frame));
}

export function getStoreExtraMethodsString(toRemove: string[], unblockKey: string) {
  return `const _____${unblockKey} = [${toRemove.join(', ')}];`;
}

export function getRestoreExtraMethodsString(removed: string[], unblockKey: string) {
  const store = `_____${unblockKey}`;
  return removed
    .map((x, key) => (x === 'makeUndefinedErrorFunction' ? '' : `const ${x} = ${store}[${key}];`))
    .join('\n');
}

export function getBlockExtraMethodsString(toRemove: string[]) {
  return toRemove
    .map(x =>
      x === 'makeUndefinedErrorFunction' ? '' : `const ${x} = makeUndefinedErrorFunction('${x}');`
    )
    .join('\n');
}
