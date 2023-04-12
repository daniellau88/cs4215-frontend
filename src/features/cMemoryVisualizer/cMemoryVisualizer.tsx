import { Context } from 'c-slang';
import { ProgramState } from 'c-slang/dist/interpreter/programState';
import React from 'react';

import { Layout } from './cMemoryVisualizerLayout';

type SetVis = (vis: React.ReactNode) => void;

/** Environment Visualizer is exposed from this class */
export default class CMemoryVisualizer {
  /** callback function to update the visualization state in the SideContentEnvVis component */
  private static setVis: SetVis;
  private static printableMode: boolean = false;
  private static compactLayout: boolean = true;
  private static programState: ProgramState;
  public static togglePrintableMode(): void {
    CMemoryVisualizer.printableMode = !CMemoryVisualizer.printableMode;
  }
  public static toggleCompactLayout(): void {
    CMemoryVisualizer.compactLayout = !CMemoryVisualizer.compactLayout;
  }
  public static getPrintableMode(): boolean {
    return CMemoryVisualizer.printableMode;
  }
  public static getCompactLayout(): boolean {
    return CMemoryVisualizer.compactLayout;
  }

  /** SideContentEnvVis initializes this onMount with the callback function */
  static init(setVis: SetVis, width: number, height: number) {
    Layout.visibleHeight = height;
    Layout.visibleWidth = width;
    this.setVis = setVis;
  }

  static clear() {
    // Layout.values.clear();
    // Layout.compactValues.clear();
  }

  /** updates the visualization state in the SideContentEnvVis component based on
   * the JS Slang context passed in */
  static drawEnv(context: Context) {
    // store environmentTree at last breakpoint.
    CMemoryVisualizer.programState = context.programState;
    if (!this.setVis) throw new Error('c memory visualizer not initialized');

    Layout.setContext(context.programState);
    this.setVis(Layout.draw());
    Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);

    // icon to blink
    const icon = document.getElementById('c_memory_visualizer-icon');
    icon && icon.classList.add('side-content-tab-alert');
  }

  static redraw() {
    if (this.programState) {
      // checks if the required diagram exists, and updates the dom node using setVis
      if (
        CMemoryVisualizer.getCompactLayout() &&
        CMemoryVisualizer.getPrintableMode() &&
        Layout.currentCompactLight !== undefined
      ) {
        this.setVis(Layout.currentCompactLight);
      } else if (
        CMemoryVisualizer.getCompactLayout() &&
        !CMemoryVisualizer.getPrintableMode() &&
        Layout.currentCompactDark !== undefined
      ) {
        this.setVis(Layout.currentCompactDark);
      } else if (
        !CMemoryVisualizer.getCompactLayout() &&
        CMemoryVisualizer.getPrintableMode() &&
        Layout.currentLight !== undefined
      ) {
        this.setVis(Layout.currentLight);
      } else if (
        !CMemoryVisualizer.getCompactLayout() &&
        !CMemoryVisualizer.getPrintableMode() &&
        Layout.currentDark !== undefined
      ) {
        this.setVis(Layout.currentDark);
      } else {
        Layout.setContext(CMemoryVisualizer.programState);
        this.setVis(Layout.draw());
      }
      Layout.updateDimensions(Layout.visibleWidth, Layout.visibleHeight);
    }
  }

  static updateDimensions(width: number, height: number) {
    if (Layout.stageRef != null && width !== null && height !== null) {
      Layout.updateDimensions(width, height);
    }
  }
}
