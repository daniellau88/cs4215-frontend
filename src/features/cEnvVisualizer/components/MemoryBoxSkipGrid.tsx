import React from 'react';
import { Group, Rect, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import { setHoveredStyle, setUnhoveredStyle } from '../cEnvVisualizerUtils';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class MemoryBoxSkipGrid extends Visible {
  /** list of all levels */
  static cumHeights: number[];

  constructor() {
    super();
    this._height = 30;
    this._width = 200;
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
          x={this.x() + 30}
          y={this.y()}
          width={this.width() - 30 - 50}
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
          stroke={Config.SA_WHITE.toString()}
          onMouseEnter={() => this.onMouseEnter()}
          onMouseLeave={() => this.onMouseLeave()}
        />
      </Group>
    );
  }
}
