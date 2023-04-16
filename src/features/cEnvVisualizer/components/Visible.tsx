import React from 'react';
import { RefObject } from 'react';

/**
 * class to implement the IVisible interface, used by both compact and non-compact components.
 */
export abstract class Visible {
  protected _x: number = 0;
  protected _y: number = 0;
  protected _width: number = 0;
  protected _height: number = 0;
  protected _isDrawn: boolean = false;
  x(): number {
    return this._x;
  }
  y(): number {
    return this._y;
  }
  width(): number {
    return this._width;
  }
  height(): number {
    return this._height;
  }
  isDrawn(): boolean {
    return this._isDrawn;
  }
  reset(): void {
    this._isDrawn = false;
  }
  ref: RefObject<any> = React.createRef();
  abstract draw(key?: number): React.ReactNode;
}
