import { BinaryWithOptionalType } from 'c-slang/dist/interpreter/typings';
import { binaryToFormattedString } from 'c-slang/dist/interpreter/utils/utils';
import React from 'react';
import { Group, Rect, Text } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import { DeepReadonly } from '../cEnvVisualizerTypes';
import { RecordDetail } from '../cEnvVisualizerUtils';
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
  boxDetails: string;

  constructor(
    /** the environment tree nodes */
    readonly address: number,
    readonly binaryType: BinaryWithOptionalType,
    readonly details?: DeepReadonly<Array<RecordDetail>>
  ) {
    super();
    this._x = 0;
    this._y = 0;
    // this.frameLevels = [];
    // this.arrayLevels = [];
    // this.levels = [];
    this.widths = [];
    this._height = 30;
    this._width = 180;
    this.boxText = '';
    this.boxDetails = '';
    this.update(address, binaryType, details);
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
  update(
    address: number,
    binaryType: BinaryWithOptionalType,
    details?: DeepReadonly<Array<RecordDetail>>
  ) {
    this.boxText = binaryToFormattedString(binaryType.binary, binaryType.type);

    if (details !== undefined && details.length > 0) {
      const topDetail = details[0];
      if (topDetail.subtype === 'stack_pointer') {
        this.boxDetails = `${topDetail.funcName} Stack Pointer`;
      } else {
        this.boxDetails = `${topDetail.funcName}.${topDetail.varName}`;
      }
    } else {
      this.boxDetails = '';
    }
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
          width={this.width() - 30 - 50}
          height={this.height()}
          key={Layout.key++}
          listening={false}
          stroke={Config.SA_WHITE.toString()}
        />
        <Text
          text={this.boxText || 'empty'}
          x={this.x() + 30}
          y={this.y()}
          width={this.width() - 30 - 50}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <Text
          text={this.boxDetails}
          x={this.x() + 130 + 10}
          y={this.y()}
          width={this.width() - 30 - 50}
          height={this.height()}
          align="left"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
      </Group>
    );
  }
}
