import { BinaryWithOptionalType } from 'c-slang/dist/interpreter/typings';
import React from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cMemoryVisualizerConfig';
import { Layout } from '../cMemoryVisualizerLayout';
import {
  DeepReadonly,
  RecordDetail,
  RecordDetailsMap,
  SnapshotOptions,
  TooltipDetails
} from '../cMemoryVisualizerTypes';
import { MemoryBoxGrid } from './MemoryBoxGrid';
import { MemoryBoxSkipGrid } from './MemoryBoxSkipGrid';
import { Visible } from './Visible';

type Snapshot = DeepReadonly<Record<number, BinaryWithOptionalType>>;

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryGrid extends Visible {
  memoryBoxes: Array<MemoryBoxSkipGrid | MemoryBoxGrid>;

  constructor(
    readonly title: string,
    readonly snapshot: Snapshot,
    readonly map: RecordDetailsMap,
    readonly snapshotOptions: DeepReadonly<SnapshotOptions>,
    readonly setTooltipDetails: (details?: TooltipDetails) => void,
    reverse: boolean = false
  ) {
    super();
    this._x = 0;
    this._y = 0;
    this._offsetX = 0;
    this._offsetY = 0;
    this.memoryBoxes = [];
    this._height = 0;
    this._width =
      Config.MemoryBoxAddressWidth +
      Config.MemoryBoxContentWidth +
      Config.MemoryBoxDetailsLeftPadding +
      Config.MemoryBoxDetailsWidth;
    this.update(snapshot, map, reverse);
  }

  destroy = () => {
    // this.frameLevels.forEach(l => l.ref.current.destroyChildren());
  };

  setOffsetX(x: number) {
    this._offsetX = x;
    this.memoryBoxes.forEach(y => y.setOffsetX(this.x()));
  }

  setX(x: number) {
    this._x = x;
    this.memoryBoxes.forEach(y => y.setOffsetX(this.x()));
  }

  /**
   * Processes updates to Layout.environmentTree.
   * @param envTreeNodes an array of different arrays of EnvTreeNodes corresponding to a single level.
   */
  update(snapshot: Snapshot, map: RecordDetailsMap, reverse: boolean = false) {
    const keys = Object.keys(snapshot);
    keys.sort((x, y) => parseInt(x) - parseInt(y)); // keys are in string
    if (reverse) keys.reverse();

    const newMemoryBoxes: Array<MemoryBoxSkipGrid | MemoryBoxGrid> = [];
    let lastY: number = Config.MemoryGridTitleHeight;
    let lastKey = -1;
    keys.forEach(key => {
      const keyInt = parseInt(key);
      const shouldAddSkip = reverse ? keyInt < lastKey - 1 : keyInt > lastKey + 1;
      if (lastKey !== -1 && shouldAddSkip) {
        const memorySkipBox = new MemoryBoxSkipGrid();
        newMemoryBoxes.push(memorySkipBox);
        const newY = lastY + memorySkipBox.height() + 1;
        memorySkipBox.setY(newY);
        lastY = newY;
      }
      const value = snapshot[key] as BinaryWithOptionalType;
      const details = map.memory[key] as DeepReadonly<Array<RecordDetail>> | undefined;
      const memoryBox = new MemoryBoxGrid(
        keyInt,
        value,
        this.snapshotOptions,
        map,
        this.setTooltipDetails,
        details
      );
      newMemoryBoxes.push(memoryBox);
      const newY = lastY + memoryBox.height() + 1;
      memoryBox.setY(newY);
      lastY = newY;
      lastKey = keyInt;
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
        <KonvaText
          text={this.title}
          x={this.x()}
          y={this.y()}
          width={this.width()}
          fontSize={30}
          height={Config.MemoryGridTitleHeight as number}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
      </Group>
    );
  }
}
