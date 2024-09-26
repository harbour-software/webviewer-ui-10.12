import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import selectors from 'selectors';
import DataElementWrapper from 'components/DataElementWrapper';
import classNames from 'classnames';

import './PageSliderOverlay.scss';

class PageSliderOverlay extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    enableFadePageNavigation: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.sliderRef = React.createRef();
    this.state = {
      isFocused: false,
    };
  }

  componentDidUpdate() {
    this.sliderRef.current.value = this.props.currentPage;
  }

  onChange = event => {
    if (!isNaN(parseInt(event.target.value))) {
      core.setCurrentPage(parseInt(event.target.value));
    }
  }

  onBlur = () => {
    this.setState({ isFocused: false });
  };

  onFocus = () => {
    this.setState({ isFocused: true });
  }

  render() {
    const { isDisabled, currentPage, totalPages, enableFadePageNavigation, dataElement } = this.props;
    if (isDisabled) {
      return null;
    }

    return (
      <DataElementWrapper
        className={classNames({
          Overlay: true,
          PageSliderOverlay: true,
          FadeOut: enableFadePageNavigation && !this.props.showNavOverlay && !this.state.isFocused
        })}
        dataElement={dataElement || "pageSliderOverlay"}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        <div className="formContainer">
          <form onBlur={this.onBlur} onFocus={this.onFocus}>
            <input type="range" ref={this.sliderRef} min="1" max={totalPages} defaultValue={currentPage} step="1" onChange={this.onChange} />
          </form>
        </div>
      </DataElementWrapper>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pageSliderOverlay'),
  isOpen: selectors.isElementOpen(state, 'pageSliderOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
  enableFadePageNavigation: selectors.shouldFadePageNavigationComponent(state),
});

export default connect(mapStateToProps)(PageSliderOverlay);