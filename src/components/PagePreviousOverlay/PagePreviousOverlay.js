import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import core from 'core';
import Button from 'components/Button';
import selectors from 'selectors';
import DataElementWrapper from 'components/DataElementWrapper';
import classNames from 'classnames';

import './PagePreviousOverlay.scss';

class PagePreviousOverlay extends React.PureComponent {
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
    if (this.props.currentPage === 1) {
      console.warn('You are at the first page');
    } else {
      const previousPage = this.props.currentPage - 1;
      try {
        core.setCurrentPage(previousPage);  
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
          PagePreviousOverlay: true,
          FadeOut: enableFadePageNavigation && !this.props.showNavOverlay && !this.state.isFocused
        })}
        dataElement={dataElement || "pagePreviousOverlay"}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        <div className="formContainer">
         <Button
            {...this.props}
            title="Go to previous page"
            img="ic_chevron_left_black_24px"
            onClick={this.onClick}
            disabled={this.props.currentPage === 1}
          />
        </div>
      </DataElementWrapper>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'pagePreviousOverlay'),
  isOpen: selectors.isElementOpen(state, 'pagePreviousOverlay'),
  currentPage: selectors.getCurrentPage(state),
  totalPages: selectors.getTotalPages(state),
  enableFadePageNavigation: selectors.shouldFadePageNavigationComponent(state),
});

export default connect(mapStateToProps)(PagePreviousOverlay);