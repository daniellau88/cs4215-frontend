import { ProgramState } from 'c-slang/dist/interpreter/programState';
import React from 'react';
import { Group, Rect } from 'react-konva';

import { ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import {
  createRecordDetailMap,
  populateRecordDetailMapWithEnv,
  populateRecordDetailMapWithStackPointer
} from '../cEnvVisualizerUtils';
import { MemoryGrid } from './MemoryGrid';
import { Visible } from './Visible';

/**
 * Grid class encapsulates a grid of frames to be drawn.
 * Grid contains alternating layers of ArrayLevel and FrameLevel.
 */
export class Grid extends Visible {
  /** list of all levels */
  widths: number[];
  static cumHeights: number[];

  rtsMemoryGrid?: MemoryGrid;
  heapMemoryGrid?: MemoryGrid;

  constructor(
    /** the environment tree nodes */
    readonly state: ProgramState
  ) {
    super();
    this._x = 0;
    this._y = 0;
    // this.frameLevels = [];
    // this.arrayLevels = [];
    // this.levels = [];
    this.widths = [];
    Grid.cumHeights = [];
    this._height = 0;
    this._width = 0;
    this.update(state);
  }

  destroy = () => {
    // this.frameLevels.forEach(l => l.ref.current.destroyChildren());
  };

  /**
   * Processes updates to Layout.environmentTree.
   * @param envTreeNodes an array of different arrays of EnvTreeNodes corresponding to a single level.
   */
  update(state: ProgramState) {
    const rtsSnapshot = state.getRTSSnapshot();
    const heapSnapshot = state.getHeapSnapshot();
    const env = state.getE();
    const rtsStart = state.getRTSStart();
    const map = createRecordDetailMap();
    populateRecordDetailMapWithEnv(map, env);
    populateRecordDetailMapWithStackPointer(map, rtsStart, rtsSnapshot, env);

    if (!this.rtsMemoryGrid) {
      this.rtsMemoryGrid = new MemoryGrid(rtsSnapshot, map);
    } else {
      this.rtsMemoryGrid.update(rtsSnapshot, map);
    }

    if (!this.heapMemoryGrid) {
      this.heapMemoryGrid = new MemoryGrid(heapSnapshot, map);
    } else {
      this.heapMemoryGrid.update(heapSnapshot, map);
    }
  }

  /**
   * Find the Grid y-coordinate given a x-position.
   * @param y absolute position
   * @returns Largest x-coordinate smaller than or equal to a given x position.
   */
  static lastYCoordBelow(y: number) {
    let l = Grid.cumHeights.length;
    while (l--) {
      if (Grid.cumHeights[l] <= y) {
        return l;
      }
    }
    return 0;
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
        {this.rtsMemoryGrid?.draw()}
        {this.heapMemoryGrid?.draw()}
      </Group>
    );
  }
}
