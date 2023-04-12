import { ProgramState } from 'c-slang/dist/interpreter/programState';
import React, { RefObject } from 'react';
import { Layer, Rect, Stage } from 'react-konva';

import CEnvVisualizer from './cEnvVisualizer';
import { Config, ShapeDefaultProps } from './cEnvVisualizerConfig';
import { Grid } from './components/Grid';

/** this class encapsulates the logic for calculating the layout */
export class Layout {
  /** the height of the stage */
  static nonCompactHeight: number;
  /** the width of the non-compact stage */
  static nonCompactWidth: number;
  /** the width of the compact stage */
  static compactWidth: number;
  /** the height of the compact stage */
  static compactHeight: number;
  /** the visible height of the stage */
  static visibleHeight: number = window.innerHeight;
  /** the visible width of the stage */
  static visibleWidth: number = window.innerWidth;
  /** total height of stage */
  static stageHeight: number = window.innerHeight;
  /** total width of stage */
  static stageWidth: number = window.innerWidth;
  /** the unique key assigned to each node */
  static key: number = 0;

  /** the environment tree */
  static context: ProgramState;
  /** grid of frames */
  static grid: Grid;

  /** memoized layout */
  static prevLayout: React.ReactNode;
  static currentDark: React.ReactNode;
  static currentLight: React.ReactNode;
  static currentCompactDark: React.ReactNode;
  static currentCompactLight: React.ReactNode;
  static stageRef: RefObject<any> = React.createRef();
  // buffer for faster rendering of diagram when scrolling
  static invisiblePaddingVertical: number = 300;
  static invisiblePaddingHorizontal: number = 300;
  static scrollContainerRef: RefObject<any> = React.createRef();

  static updateDimensions(width: number, height: number) {
    // update the size of the scroll container and stage given the width and height of the sidebar content.
    Layout.visibleWidth = width;
    Layout.visibleHeight = height;
    if (
      Layout.stageRef.current !== null &&
      (Math.min(Layout.width(), window.innerWidth) > Layout.stageWidth ||
        Math.min(Layout.height(), window.innerHeight) > Layout.stageHeight)
    ) {
      Layout.currentLight = undefined;
      Layout.currentDark = undefined;
      Layout.currentCompactLight = undefined;
      Layout.currentCompactDark = undefined;
      Layout.stageWidth = Math.min(Layout.width(), window.innerWidth);
      Layout.stageHeight = Math.min(Layout.height(), window.innerHeight);
      Layout.stageRef.current.width(Layout.stageWidth);
      Layout.stageRef.current.height(Layout.stageHeight);
      CEnvVisualizer.redraw();
    }
    if (Layout.stageHeight > Layout.visibleHeight) {
    }
    Layout.invisiblePaddingVertical =
      Layout.stageHeight > Layout.visibleHeight
        ? (Layout.stageHeight - Layout.visibleHeight) / 2
        : 0;
    Layout.invisiblePaddingHorizontal =
      Layout.stageWidth > Layout.visibleWidth ? (Layout.stageWidth - Layout.visibleWidth) / 2 : 0;

    const container: HTMLElement | null = this.scrollContainerRef.current as HTMLDivElement;
    if (container) {
      container.style.width = `${Layout.visibleWidth}px`;
      container.style.height = `${Layout.visibleHeight}px`;
    }
  }

  /** processes the runtime context from JS Slang */
  static setContext(programState: ProgramState): void {
    Layout.currentLight = undefined;
    Layout.currentDark = undefined;
    Layout.currentCompactLight = undefined;
    Layout.currentCompactDark = undefined;
    Layout.context = programState;
    Layout.key = 0;

    Layout.initializeGrid();
  }

  public static width(): number {
    return CEnvVisualizer.getCompactLayout() ? Layout.compactWidth : Layout.nonCompactWidth;
  }

  public static height(): number {
    return CEnvVisualizer.getCompactLayout() ? Layout.compactHeight : Layout.nonCompactHeight;
  }

  /** initializes grid */
  private static initializeGrid(): void {
    if (this.grid === undefined) {
      this.grid = new Grid(Layout.context);
    } else {
      this.grid.update(Layout.context);
    }
  }

  private static handleScrollPosition(x: number, y: number) {
    const dx = x - Layout.invisiblePaddingHorizontal;
    const dy = y - Layout.invisiblePaddingVertical;
    this.stageRef.current.container().style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    this.stageRef.current.x(-dx);
    this.stageRef.current.y(-dy);
  }

  static draw(): React.ReactNode {
    if (Layout.key !== 0) {
      return Layout.prevLayout;
    } else {
      const layout = (
        <div className={'sa-env-visualizer'}>
          <div
            id="scroll-container"
            ref={Layout.scrollContainerRef}
            onScroll={e =>
              Layout.handleScrollPosition(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)
            }
            style={{
              width: Layout.visibleWidth,
              height: Layout.visibleHeight,
              overflow: 'auto',
              margin: '10px'
            }}
          >
            <div
              id="large-container"
              style={{
                width: Layout.width(),
                height: Layout.height(),
                overflow: 'hidden',
                backgroundColor: CEnvVisualizer.getPrintableMode()
                  ? Config.PRINT_BACKGROUND.toString()
                  : Config.SA_BLUE.toString()
              }}
            >
              <Stage width={Layout.stageWidth} height={Layout.stageHeight} ref={this.stageRef}>
                <Layer>
                  <Rect
                    {...ShapeDefaultProps}
                    x={0}
                    y={0}
                    width={Layout.width()}
                    height={Layout.height()}
                    fill={
                      CEnvVisualizer.getPrintableMode()
                        ? Config.PRINT_BACKGROUND.toString()
                        : Config.SA_BLUE.toString()
                    }
                    key={Layout.key++}
                    listening={false}
                  />
                  {Layout.grid.draw()}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      );
      Layout.prevLayout = layout;
      if (CEnvVisualizer.getCompactLayout()) {
        if (CEnvVisualizer.getPrintableMode()) {
          Layout.currentCompactLight = layout;
        } else {
          Layout.currentCompactDark = layout;
        }
      } else {
        if (CEnvVisualizer.getPrintableMode()) {
          Layout.currentLight = layout;
        } else {
          Layout.currentDark = layout;
        }
      }

      return layout;
    }
  }
}
