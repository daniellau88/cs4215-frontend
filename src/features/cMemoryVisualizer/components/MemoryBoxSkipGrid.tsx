import React from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cMemoryVisualizerConfig';
import { Layout } from '../cMemoryVisualizerLayout';
import { setHoveredStyle, setUnhoveredStyle } from '../cMemoryVisualizerUtils';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryBoxSkipGrid extends Visible {
  constructor() {
    super();
    this._height = Config.MemoryBoxHeight;
    this._width =
      Config.MemoryBoxAddressWidth +
      Config.MemoryBoxContentWidth +
      Config.MemoryBoxDetailsLeftPadding +
      Config.MemoryBoxDetailsWidth;
  }

  setOffsetX(x: number) {
    this._offsetX = x;
  }

  setY(y: number) {
    this._y = y;
  }

  onMouseEnter = () => {
    setHoveredStyle(this.ref.current);
  };

  onMouseLeave = () => {
    setUnhoveredStyle(this.ref.current);
  };

  draw(): React.ReactNode {
    return (
      <Group key={Layout.key++} ref={this.ref}>
        <KonvaText
          text={'...'}
          x={this.x() + Config.MemoryBoxAddressWidth}
          y={this.y()}
          width={Config.MemoryBoxContentWidth as number}
          height={this.height()}
          align="center"
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
