import { ProgramState } from 'c-slang/dist/interpreter/programState';
import React from 'react';
import { Group, Label as KonvaLabel, Rect, Tag as KonvaTag, Text as KonvaText } from 'react-konva';

import { Config, ShapeDefaultProps } from '../cEnvVisualizerConfig';
import { Layout } from '../cEnvVisualizerLayout';
import { DeepReadonly, SnapshotOptions, TooltipDetails } from '../cEnvVisualizerTypes';
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
  tooltipDetail?: TooltipDetails;
  readonly labelRef: React.RefObject<any> = React.createRef();
  readonly labelTextRef: React.RefObject<any> = React.createRef();

  constructor(
    /** the environment tree nodes */
    readonly state: ProgramState
  ) {
    super();
    this._x = 0;
    this._y = 0;
    this.widths = [];
    Grid.cumHeights = [];
    this._height = 0;
    this._width = 0;
    this.update(state);
  }

  setOffsetX(x: number) {
    this._offsetX = x;
    this.rtsMemoryGrid?.setOffsetX(this.x());
    this.heapMemoryGrid?.setOffsetX(this.x());
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
    const snapshotOptions = {
      rts: rtsSnapshot,
      heap: heapSnapshot
    } as DeepReadonly<SnapshotOptions>;
    const env = state.getE();
    const rtsStart = state.getRTSStart();
    const map = createRecordDetailMap();
    populateRecordDetailMapWithEnv(map, env);
    populateRecordDetailMapWithStackPointer(map, rtsStart, rtsSnapshot, env);

    const setTooltipDetail = (detail?: TooltipDetails) => {
      this.tooltipDetail = detail;
      if (detail !== undefined) {
        this.labelTextRef.current.text(detail.tooltipMessage);
        this.labelRef.current.position({ x: detail.x, y: detail.y });
        this.labelRef.current.moveToTop();
        this.labelRef.current.show();
      } else {
        this.labelRef.current.hide();
      }
    }
    if (!this.rtsMemoryGrid) {
      this.rtsMemoryGrid = new MemoryGrid(rtsSnapshot, map, snapshotOptions, setTooltipDetail);
    } else {
      this.rtsMemoryGrid.update(rtsSnapshot, map);
    }

    if (!this.heapMemoryGrid) {
      this.heapMemoryGrid = new MemoryGrid(heapSnapshot, map, snapshotOptions, setTooltipDetail, true);
    } else {
      this.heapMemoryGrid.update(heapSnapshot, map, true);
    }
    this.heapMemoryGrid.setX(300);
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

        <KonvaLabel
          visible={false}
          ref={this.labelRef}
        >
          <KonvaTag stroke="black" fill={'black'} opacity={Number(Config.FnTooltipOpacity)} />
          <KonvaText
            fontFamily={Config.FontFamily.toString()}
            fontSize={Number(Config.FontSize)}
            fontStyle={Config.FontStyle.toString()}
            fill={Config.SA_WHITE.toString()}
            wrap="char"
            padding={5}
            width={300}
            ref={this.labelTextRef}
          />
        </KonvaLabel>
      </Group>
    );
  }
}
