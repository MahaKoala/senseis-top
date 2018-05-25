import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import TotalsBar from '../components/totals-bar';
import PointerHandler from '../components/pointer-down-handler';
import {
  INCREMENT_LIFE,
  DECREMENT_LIFE,
  SET_LIFE_REQUEST,
} from '../../shared/action-types';

class Totals extends React.PureComponent {
  static propTypes = {
    self: PropTypes.object,
    activeRoom: PropTypes.object,
    otherUsers: PropTypes.array,
    incrementLife: PropTypes.func,
    decrementLife: PropTypes.func,
  };

  static contextTypes = {
    wsSend: PropTypes.func,
  };

  componentDidUpdate(prevProps) {
    const {self, activeRoom} = this.props;
    const {self: prevSelf} = prevProps;

    if (!activeRoom) return;
    if (self.life === prevSelf.life) return;

    this.context.wsSend({type: SET_LIFE_REQUEST, ...self, ...activeRoom});
  }

  createPointerDownHandler = lifeTotalFn => {
    return () => {
      lifeTotalFn();
      clearTimeout(this.pointerDownTimeout);
      this.pointerDownTimeout = setTimeout(() => {
        this.interval = setInterval(lifeTotalFn, 48);
      }, 500);
    };
  };

  handleIncrement = this.createPointerDownHandler(this.props.incrementLife);
  handleDecrement = this.createPointerDownHandler(this.props.decrementLife);

  clearTimeouts = () => {
    clearTimeout(this.pointerDownTimeout);
    clearInterval(this.interval);
  };

  componentWillUnmount() {
    this.clearTimeouts();
  }

  render() {
    const {
      self: {life},
      otherUsers,
    } = this.props;
    return (
      <Fragment>
        {otherUsers.length > 0 && <TotalsBar users={otherUsers} />}
        <main className="view-main view-main--centered">
          <div className="life-total">
            <div className="life-total__number">{life}</div>
            <div className="life-total__controls">
              <PointerHandler
                onPointerDown={this.handleDecrement}
                onPointerUp={this.clearTimeouts}
              >
                {ref => (
                  <button ref={ref} className="button life-total__control">
                    -
                  </button>
                )}
              </PointerHandler>
              <PointerHandler
                onPointerDown={this.handleIncrement}
                onPointerUp={this.clearTimeouts}
              >
                {ref => (
                  <button ref={ref} className="button life-total__control">
                    +
                  </button>
                )}
              </PointerHandler>
            </div>
          </div>
        </main>
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {self, activeRoom, otherUsers} = state;
  return {
    self,
    activeRoom,
    otherUsers,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    incrementLife: () => dispatch({type: INCREMENT_LIFE}),
    decrementLife: () => dispatch({type: DECREMENT_LIFE}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Totals);
