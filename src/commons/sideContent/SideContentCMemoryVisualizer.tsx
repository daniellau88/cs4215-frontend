import { Classes } from '@blueprintjs/core';
import { debounce } from 'lodash';
import * as React from 'react';
import CMemoryVisualizer from 'src/features/cMemoryVisualizer/cMemoryVisualizer';

import Constants from '../utils/Constants';

type State = {
  visualization: React.ReactNode;
  height: number;
  width: number;
};

class SideContentMemoryVisualizer extends React.Component<
  { editorWidth?: string; sideContentHeight?: number },
  State
> {
  constructor(props: any) {
    super(props);
    this.state = {
      visualization: null,
      width: this.calculateWidth(props.editorWidth),
      height: this.calculateHeight(props.sideContentHeight)
    };
    CMemoryVisualizer.init(
      visualization => {
        return this.setState({ visualization });
      },
      this.state.width,
      this.state.height
    );
  }

  private calculateWidth(editorWidth?: string) {
    const horizontalPadding = 50;
    const maxWidth = 5000; // limit for visible diagram width for huge screens
    let width;
    if (editorWidth === undefined) {
      width = window.innerWidth - horizontalPadding;
    } else {
      width = Math.min(
        maxWidth,
        (window.innerWidth * (100 - parseFloat(editorWidth))) / 100 - horizontalPadding
      );
    }
    return Math.min(width, maxWidth);
  }

  private calculateHeight(sideContentHeight?: number) {
    const verticalPadding = 150;
    const maxHeight = 5000; // limit for visible diagram height for huge screens
    let height;
    if (window.innerWidth < Constants.mobileBreakpoint) {
      // mobile mode
      height = window.innerHeight - verticalPadding;
    } else if (sideContentHeight === undefined) {
      height = window.innerHeight - verticalPadding;
    } else {
      height = sideContentHeight - verticalPadding;
    }
    return Math.min(height, maxHeight);
  }

  handleResize = debounce(() => {
    const newWidth = this.calculateWidth(this.props.editorWidth);
    const newHeight = this.calculateHeight(this.props.sideContentHeight);
    if (newWidth !== this.state.width || newHeight !== this.state.height) {
      this.setState({
        height: newHeight,
        width: newWidth
      });
      CMemoryVisualizer.updateDimensions(newWidth, newHeight);
    }
  }, 300);

  componentDidMount() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    CMemoryVisualizer.redraw();
  }
  componentWillUnmount() {
    this.handleResize.cancel();
    window.removeEventListener('resize', this.handleResize);
  }

  componentDidUpdate(prevProps: { editorWidth?: string; sideContentHeight?: number }) {
    if (
      prevProps.sideContentHeight !== this.props.sideContentHeight ||
      prevProps.editorWidth !== this.props.editorWidth
    ) {
      this.handleResize();
    }
  }

  public render() {
    return (
      <div className={Classes.DARK}>
        {this.state.visualization || (
          <p id="env-visualizer-default-text" className={Classes.RUNNING_TEXT}>
            The memory model visualizer generates memory model diagrams, particularly the Runtime
            Stack (RTS) and Heap. Both the RTS and heap uses the same set of memory. The RTS grows
            upwards (increasing address) while heap grows downwards (decreasing address). This is in
            line with the C specification of the memory model.
            <br />
            <br />
            It is activated by setting breakpoints before you run the program. You can set a
            breakpoint by clicking on the gutter of the editor (where all the line numbers are, on
            the left). When the program runs into a breakpoint, the visualizer displays the state of
            the environments before the statement is evaluated, which starts in the line in which
            you set the breakpoint. Every breakpoint must be at the beginning of a statement.
          </p>
        )}
      </div>
    );
  }
}

export default SideContentMemoryVisualizer;
