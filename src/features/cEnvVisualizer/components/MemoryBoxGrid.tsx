import { BinaryWithOptionalType } from 'c-slang/dist/interpreter/typings';
import { binaryToFormattedString } from 'c-slang/dist/interpreter/utils/utils';
import React from 'react';
import { Group, Label as KonvaLabel, Rect, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import {
  DeepReadonly,
  RecordDetail,
  RecordDetailsMap,
  SnapshotOptions
} from '../cEnvVisualizerTypes';
import {
  getTooltipMessageForReference,
  getToolTipMessageForValue,
  setHoveredStyle,
  setUnhoveredStyle
} from '../cEnvVisualizerUtils';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryBoxGrid extends Visible {
  /** list of all levels */
  widths: number[];
  static cumHeights: number[];
  readonly boxText: string;
  readonly boxDetails: string;
  readonly labelRef: React.RefObject<any> = React.createRef();
  readonly tooltip: string;

  constructor(
    /** the environment tree nodes */
    readonly address: number,
    readonly binaryType: BinaryWithOptionalType,
    readonly snapshotOptions: DeepReadonly<SnapshotOptions>,
    readonly map: RecordDetailsMap,
    readonly details?: DeepReadonly<Array<RecordDetail>>
  ) {
    super();
    this._x = 0;
    this._y = 0;
    this.widths = [];
    this._height = 30;
    this._width = 200;
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

    const valueToolTip = `Actual memory value:\n${getToolTipMessageForValue(
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
    if (this.tooltip) {
      this.labelRef.current.moveToTop();
      this.labelRef.current.show();
    }
    setHoveredStyle(this.ref.current);
  };

  onMouseLeave = () => {
    if (this.tooltip) {
      this.labelRef.current.hide();
    }
    setUnhoveredStyle(this.ref.current);
  };

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        <KonvaText
          text={this.address.toString()}
          x={this.x()}
          y={this.y()}
          width={30}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <KonvaText
          text={this.boxText || 'empty'}
          x={this.x() + 30}
          y={this.y()}
          width={this.width() - 30 - 50}
          height={this.height()}
          align="center"
          verticalAlign="middle"
          fill={Config.SA_WHITE.toString()}
        />
        <KonvaText
          text={this.boxDetails}
          x={this.x() + 150 + 10}
          y={this.y()}
          width={this.width() - 30 - 50}
          height={this.height()}
          align="left"
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
          stroke={Config.SA_WHITE.toString()}
          onClick={e => {
            console.log('hiiii');
          }}
          onMouseEnter={() => this.onMouseEnter()}
          onMouseLeave={() => this.onMouseLeave()}
        />
        <KonvaLabel
          x={this.x() + this.width() + Config.TextPaddingX * 2}
          y={this.y() - Config.TextPaddingY}
          visible={false}
          ref={this.labelRef}
        >
          <KonvaTag stroke="black" fill={'black'} opacity={Number(Config.FnTooltipOpacity)} />
          <KonvaText
            text={this.tooltip}
            fontFamily={Config.FontFamily.toString()}
            fontSize={Number(Config.FontSize)}
            fontStyle={Config.FontStyle.toString()}
            fill={Config.SA_WHITE.toString()}
            wrap="char"
            padding={5}
            width={300}
          />
        </KonvaLabel>
      </Group>
    );
  }
}
