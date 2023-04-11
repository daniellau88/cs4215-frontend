import { BinaryWithOptionalType } from 'c-slang/dist/interpreter/typings';
import React from 'react';
import { Group, Rect } from 'react-konva';

import { ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import { DeepReadonly } from '../cEnvVisualizerTypes';
import { RecordDetail, RecordDetailsMap } from '../cEnvVisualizerUtils';
import { MemoryBoxGrid } from './MemoryBoxGrid';
import { Visible } from './Visible';

type Snapshot = DeepReadonly<Record<number, BinaryWithOptionalType>>;

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryGrid extends Visible {
  /** list of all levels */
  widths: number[];
  static cumHeights: number[];

  memoryBoxes: MemoryBoxGrid[];

  constructor(
    /** the environment tree nodes */
    readonly snapshot: Snapshot,
    readonly map: DeepReadonly<RecordDetailsMap>
  ) {
    super();
    this._x = 0;
    this._y = 0;
    this.widths = [];
    this.memoryBoxes = [];
    this._height = 0;
    this._width = 0;
    this.update(snapshot, map);
  }

  destroy = () => {
    // this.frameLevels.forEach(l => l.ref.current.destroyChildren());
  };

  /**
   * Processes updates to Layout.environmentTree.
   * @param envTreeNodes an array of different arrays of EnvTreeNodes corresponding to a single level.
   */
  update(snapshot: Snapshot, map: DeepReadonly<RecordDetailsMap>) {
    const keys = Object.keys(snapshot);
    keys.sort((x, y) => parseInt(x) - parseInt(y)); // keys are in string

    const newMemoryBoxes: MemoryBoxGrid[] = [];
    let lastY = 0;
    keys.forEach((key, i) => {
      const value = snapshot[key] as BinaryWithOptionalType;
      const details = map[key] as DeepReadonly<Array<RecordDetail>> | undefined;
      const memoryBox = new MemoryBoxGrid(parseInt(keys[i]), value, details);
      newMemoryBoxes.push(memoryBox);
      const newY = lastY + memoryBox.height();
      memoryBox.setY(newY);
      lastY = newY;
    });

    this.memoryBoxes = newMemoryBoxes;
  }

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++}>
        <Rect
          {...ShapeDefaultProps}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          key={Layout.key++}
          listening={false}
        />
        {this.memoryBoxes.map(box => box.draw())}
      </Group>
    );
  }
}
