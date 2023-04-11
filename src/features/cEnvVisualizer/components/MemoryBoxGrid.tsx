import { BinaryWithOptionalType } from 'c-slang/dist/interpreter/typings';
import { binaryToFormattedString } from 'c-slang/dist/interpreter/utils/utils';
import React from 'react';
import { Group, Rect, Text } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryBoxGrid extends Visible {
  /** list of all levels */
  widths: number[];
  static cumHeights: number[];
  boxText: string;

  constructor(
    /** the environment tree nodes */
    readonly binaryType: BinaryWithOptionalType,
    readonly address: number
  ) {
    super();
    this._x = 0;
    this._y = 0;
    // this.frameLevels = [];
    // this.arrayLevels = [];
    // this.levels = [];
    this.widths = [];
    this._height = 30;
    this._width = 130;
    this.boxText = '';
    this.update(binaryType);
  }

  setY(y: number) {
    this._y = y;
  }

  destroy = () => {
    // this.frameLevels.forEach(l => l.ref.current.destroyChildren());
  };

  /**
   * Processes updates to Layout.environmentTree.
   * @param envTreeNodes an array of different arrays of EnvTreeNodes corresponding to a single level.
   */
  update(binaryType: BinaryWithOptionalType) {
    this.boxText = binaryToFormattedString(binaryType.binary, binaryType.type);
  }

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++}>
        <Text
          text={this.address.toString()}
          x={this.x()}
          y={this.y()}
          width={30}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <Rect
          {...ShapeDefaultProps}
          x={this.x() + 30}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          key={Layout.key++}
          listening={false}
          stroke={Config.SA_WHITE.toString()}
        />
        <Text
          text={this.boxText || 'empty'}
          x={this.x() + 30}
          y={this.y()}
          width={this.width()}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
      </Group>
    );
  }
}
