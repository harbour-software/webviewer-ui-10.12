import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import Button from 'components/Button';
import selectors from 'selectors';
import DataElementWrapper from 'components/DataElementWrapper';
import classNames from 'classnames';

import './PageNextOverlay.scss';

class PageNextOverlay extends React.PureComponent {
  static propTypes = {
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    currentPage: PropTypes.number,
    totalPages: PropTypes.number,
    enableFadePageNavigation: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  onClick = () => {
    if (this.props.currentPage === this.props.totalPages) {
      console.warn('You are at the last page');
    } else {
      const nextPage = this.props.currentPage + 1;
      try {
        core.setCurrentPage(nextPage);  
      } 
      catch (err) {
        console.log(err);
      }
    }
  }

  render() {
    const { isDisabled, enableFadePageNavigation, dataElement } = this.props;
    if (isDisabled) {
      return null;
    }

    return (
      <DataElementWrapper
        className={classNames({
          Overlay: true,
          PageNextOverlay: true,
          FadeOut: enableFadePageNavigation && !this.props.showNavOverlay && !this.state.isFocused
        })}
        dataElement={dataElement || "pageNextOverlay"}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        <div className="formContainer">
          <Button
            {...this.props}
            title="Go to next page"
            img="ic_chevron_right_black_24px"
            onClick={this.onClick}
            disabled={this.props.currentPage === this.props.totalPages}
          />
        </div>
      </DataElementWrapper>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pageNextOverlay'),
  isOpen: selectors.isElementOpen(state, 'pageNextOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
  enableFadePageNavigation: selectors.shouldFadePageNavigationComponent(state),
});

export default connect(mapStateToProps)(PageNextOverlay);