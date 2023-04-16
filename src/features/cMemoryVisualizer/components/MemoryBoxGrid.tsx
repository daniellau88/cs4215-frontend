import { BinaryWithOptionalType } from 'c-slang/dist/interpreter/typings';
import { binaryToFormattedString } from 'c-slang/dist/interpreter/utils/utils';
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
import {
  getTooltipMessageForReference,
  getToolTipMessageForValue,
  setHoveredStyle,
  setUnhoveredStyle
} from '../cMemoryVisualizerUtils';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryBoxGrid extends Visible {
  readonly boxText: string;
  readonly boxDetails: string;
  readonly tooltip: string;

  constructor(
    /** the environment tree nodes */
    readonly address: number,
    readonly binaryType: BinaryWithOptionalType,
    snapshotOptions: DeepReadonly<SnapshotOptions>,
    readonly map: RecordDetailsMap,
    readonly setTooltipDetails: (details?: TooltipDetails) => void,
    readonly details?: DeepReadonly<Array<RecordDetail>>
  ) {
    super();
    this._x = 0;
    this._y = 0;
    this._height = Config.MemoryBoxHeight;
    this._width =
      Config.MemoryBoxAddressWidth +
      Config.MemoryBoxContentWidth +
      Config.MemoryBoxDetailsLeftPadding +
      Config.MemoryBoxDetailsWidth;
    this.boxText = binaryToFormattedString(binaryType.binary, binaryType.type);

    if (details !== undefined && details.length > 0) {
      const topDetail = details[0];
      const hasMore = details.length > 1;
      if (topDetail.subtype === 'stack_pointer') {
        this.boxDetails = `${topDetail.funcName} stack pointer`;
      } else if (topDetail.subtype === 'variable') {
        this.boxDetails = `${topDetail.funcName}.${topDetail.varName}${hasMore ? ', ...' : ''}`;
      } else {
        this.boxDetails = '';
      }
    } else {
      this.boxDetails = '';
    }

    const valueToolTip = `Suggested value:\n${getToolTipMessageForValue(
      binaryType,
      snapshotOptions,
      map
    )}`;

    if (details) {
      const referenceTooltip = details
        .map(x => getTooltipMessageForReference(x, snapshotOptions, map))
        .join('\n\n');
      this.tooltip = referenceTooltip + '\n\n' + valueToolTip;
    } else {
      this.tooltip = valueToolTip;
    }
  }

  setOffsetX(x: number) {
    this._offsetX = x;
  }

  setY(y: number) {
    this._y = y;
  }

  onMouseEnter = () => {
    this.setTooltipDetails({
      tooltipMessage: this.tooltip,
      x: this.x() + this.width() + Config.TextPaddingX * 2,
      y: this.y() - Config.TextPaddingY
    });
    setHoveredStyle(this.ref.current);
  };

  onMouseLeave = () => {
    this.setTooltipDetails(undefined);
    setUnhoveredStyle(this.ref.current);
  };

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        <KonvaText
          text={this.address.toString()}
          x={this.x()}
          y={this.y()}
          width={Config.MemoryBoxAddressWidth as number}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <KonvaText
          text={this.boxText || 'empty'}
          x={this.x() + Config.MemoryBoxAddressWidth}
          y={this.y()}
          width={Config.MemoryBoxContentWidth as number}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <KonvaText
          text={this.boxDetails}
          x={
            this.x() +
            Config.MemoryBoxAddressWidth +
            Config.MemoryBoxContentWidth +
            Config.MemoryBoxDetailsLeftPadding
          }
          y={this.y()}
          width={Config.MemoryBoxDetailsWidth as number}
          height={this.height()}
          align="left"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <Rect
          {...ShapeDefaultProps}
          x={this.x() + Config.MemoryBoxAddressWidth}
          y={this.y()}
          width={Config.MemoryBoxContentWidth as number}
          height={this.height()}
          key={Layout.key++}
          stroke={Config.SA_WHITE.toString()}
          onMouseEnter={() => this.onMouseEnter()}
          onMouseLeave={() => this.onMouseLeave()}
        />
      </Group>
    );
  }
}
