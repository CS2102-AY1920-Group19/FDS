import React, { Component } from "react";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@material-ui/core";
import NavBar from "../../../components/Navigation/Navigation";

import { AccountDetails, RewardPoints } from "./components";
import { Sidebar } from "../../../layouts/Customer/components";
import { authenticationService } from "../../../services";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     //padding: theme.spacing(4),
//   },
// }));

class Account extends Component {
  state = { 
    id: null,
    email: null,
    firstname: null,
    lastname: null,
    points: null,
    creditcard: null,
    password: null
  }

  componentDidMount() {
    authenticationService.currentUser.subscribe((x) => {
        console.log('omo',x);
        if (x !== null) {
            this.setState({ id: x.id, email: x.email, firstname: x.first_name, lastname: x.last_name, points: x.points, password: x.password, creditcard: x.ccid }, () => {console.log('weewoo', this.state.password)})
        }
    });
  }

  render() {
    return (
      <div>
        <NavBar history={this.props.history} />
        <Grid container spacing={6}>
          <Grid item lg={6} sm={6} xl={6} xs={12}>
            <Sidebar pageWrapId={"page-wrap"} outerContainerId={"Home"} />
          </Grid>
          <Grid container item spacing={4} id="page-wrap">
            <Grid item lg={6} sm={6} xl={6} xs={12}>
              {/* <RewardPoints /> */}
            </Grid>

            <Grid item lg={12} sm={12} xl={12} xs={12}>
              <AccountDetails email={this.state.email} firstname={this.state.firstname} lastname={this.state.lastname} creditcard={this.state.creditcard} password={this.state.password} id={this.state.id} history={this.props.history} />
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Account;
