import React from 'react';
import {connect} from 'react-redux'
import CountUp from 'react-countup';

function Value({current, previous}) {
  return (
    <div>
      <CountUp
        start={previous}
        end={current}
        duration={0.2}
        separator=","
        prefix="$"
      />
    </div>
  );
}

const mapState = (state, ownProps) => ({
  current: ownProps.children(state.meta.current),
  previous: state.meta.previous ? ownProps.children(state.meta.previous) : null
});

export default connect(mapState)(Value);
