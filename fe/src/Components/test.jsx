import React, { Component } from "react";

export default class test extends Component {
  render() {
    return (
      <div>
        <Route
          path="/"
          exact
          render={(
            props // props are history, location, match
          ) => <Home title="Stefano" {...props} />} // in this way you can pass your own props along with the router ones
        />

        <Route
          path="/"
          exact
          render={props => <Home title="Manuel" {...props} />}
        />
      </div>
    );
  }
}
