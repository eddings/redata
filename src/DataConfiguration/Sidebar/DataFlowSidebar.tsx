import * as React from 'react';
import { DatasetNode, GraphNode, Template, TransformNode } from 'remodel-vis';

import Sidebar from '../../Widgets/Sidebar';
import DatasetPreview from './DatasetPreview';
import VegaPreview from './VegaPreview';

import './DataFlowSidebar.css';

interface Props {
  focusedNode: GraphNode;
  datasetTemplateMap: Map<GraphNode, Template>
  updateFocusedNode: () => void;
}
interface State {
  isTitleInputVisible: boolean;
  isTextAreaFocused: boolean;
  textAreaText: string;
}

export default class DataFlowsidebar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isTitleInputVisible: false,
      isTextAreaFocused: false,
      textAreaText: ''
    };
  }

  private onNodeNameChanged(event: any) {
    if (event.key === 'Enter') {
      this.setState({ isTitleInputVisible: false });
      return;
    }

    this.props.focusedNode.name = event.target.value;
    this.props.updateFocusedNode();
  }

  private getSelectedNodeName() {
    if (this.props.focusedNode === null) {
      // focused node was unselected
      return '';
    } else if (this.props.focusedNode === undefined) {
      // focused node was deleted
      return '';
    } else if (this.props.focusedNode instanceof DatasetNode) {
      return this.props.focusedNode.name;
    } else if (this.props.focusedNode instanceof TransformNode) {
      return this.props.focusedNode.name;
    }
  }

  private renderDatasetNodeConfiguration() {
    if (!(this.props.focusedNode instanceof DatasetNode)) {
      return false;
    }

    return (
      <div id="dataflowSidebarDatasetNodeConfiguration">
        <DatasetPreview datasetNode={ this.props.focusedNode } />
      </div>
    );
  }

  private getNodeType() {
    let type: string = 'data';

    if (this.props.focusedNode instanceof TransformNode) {
      type = 'transform';
    }

    return type;
  }

  private onTransformTextareaChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (!(this.props.focusedNode instanceof TransformNode)) { return false; }

    // update the focused transform only if the text in the secondary textfield is a valid json
    // object
    this.setState({ textAreaText: event.target.value });

    try {
      const value = JSON.parse(event.target.value);
      this.props.focusedNode.transform = value;
      this.props.updateFocusedNode();
    } catch(error) {
      throw error;
    }
  }

  private renderTitle() {
    if (this.props.focusedNode === undefined) { return false; }
    if (this.props.focusedNode === null) { return false; }

    return (
      <div id="dataflowSidebarTitle">
        <h2
          className={ this.state.isTitleInputVisible ? 'hidden' : '' }
          onClick={ () => this.setState({ isTitleInputVisible: true }) }>
          <span className="focusedNodeTitle">{ this.getSelectedNodeName() }</span>
          <span className="focusedNodeType">{ this.getNodeType() }</span>
        </h2>
        <input
          id="modifyNodeName"
          className={ this.state.isTitleInputVisible ? '' : 'hidden' }
          type="text"
          value={ this.props.focusedNode.name }
          onChange={ this.onNodeNameChanged.bind(this) }
          onBlur={ () => this.setState({ isTitleInputVisible: false }) }
        />
      </div>
    );
  }

  private renderTransformNodeConfiguration() {
    if (!(this.props.focusedNode instanceof TransformNode)) { return false; }

    const text = JSON.stringify(this.props.focusedNode.transform, null, 2);

    return (
      <div id="dataflowSidebarTransformNodeConfiguration">
        <textarea
          id="dataflowSidebarPreview"
          className={ this.state.isTextAreaFocused ? 'hidden' : '' }
          value={ text }
          readOnly={ true }
          onClick={ () => this.setState({ isTextAreaFocused: true, textAreaText: text }) } />
        <textarea
          id="dataflowSidebarEdit"
          className={ this.state.isTextAreaFocused ? '' : 'hidden' }
          value={ this.state.textAreaText }
          autoFocus={ this.state.isTextAreaFocused }
          onBlur={ () => this.setState({ isTextAreaFocused: false }) }
          onChange={ this.onTransformTextareaChanged.bind(this) } />
      </div>
    );
  }

  private renderFocusedNodeConfiguration() {
    if (this.props.focusedNode === null) { return false; }
    if (this.props.focusedNode === undefined) { return false; }

    if (this.props.focusedNode instanceof DatasetNode) {
      return this.renderDatasetNodeConfiguration();
    }

    return this.renderTransformNodeConfiguration();
  }

  private renderVegaPreview() {
    const nodeForPreview = this.props.focusedNode instanceof TransformNode
      ? this.props.focusedNode.getRootDatasetNode()
      : this.props.focusedNode;

    const focusedNodeTemplate = this.props.datasetTemplateMap.get(nodeForPreview);

    return (
      <VegaPreview
        focusedNode={ this.props.focusedNode }
        focusedNodeTemplate={ focusedNodeTemplate } />
    );
  }

  private renderBody() {
    return (
      <div className="dataFlowSidebarBody" style={ { maxHeight: window.innerHeight - 200 }}>
        { this.renderFocusedNodeConfiguration() }
        { this.renderVegaPreview() }
      </div>
    );
  }

  public render() {
    return (
      <Sidebar
        id="dataFlowSidebar"
        positionLeft={ false }
        hidden={ this.props.focusedNode === null || this.props.focusedNode === undefined }
        height={ window.innerHeight - 135 }>

        { this.renderTitle() }
        { this.renderBody() }
      </Sidebar>
    );
  }
}