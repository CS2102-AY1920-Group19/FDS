import React, { useState } from "react";
import { makeStyles } from "@material-ui/styles";
import FoodItem from "./components";
import { Grid } from "@material-ui/core";
import { Sidebar } from "../../../layouts/Customer/components";
import NavBar from "../../../components/Navigation/Navigation";

import SearchInput from "./components/SearchInput";
import { Button } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    // padding: theme.spacing(3),
  },
  content: {
    // marginTop: theme.spacing(2),
  },
  pagination: {
    // marginTop: theme.spacing(3),
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    // marginTop: theme.spacing(1),
  },
  searchInput: {
    // marginRight: theme.spacing(1),
  },
}));

const CustomerSearch = (props) => {
  const classes = useStyles();

  const [searchValue, setSearchValue] = useState("");
  const [showFoodItem, setShowFoodItem] = useState(false);

  const handleEnter = () => {
    console.log(searchValue);
    setShowFoodItem(true);
  };

  const handleSearchInput = (event) => {
    setSearchValue(event.target.value);
  };

  return (
    <div className={classes.root}>
      <NavBar history={props.history} />

      <Grid container spacing={6}>
        <Grid item lg={6} sm={6} xl={6} xs={12}>
          <Sidebar pageWrapId={"page-wrap"} outerContainerId={"Home"} />
        </Grid>
        <Grid container justify="center" id="page-wrap">
          <div className={classes.row} style={{ marginBottom: "16px" }}>
            <SearchInput
              className={classes.searchInput}
              placeholder="Search Item"
              onChange={handleSearchInput}
            />
            <Button variant="contained" color="primary" onClick={handleEnter}>
              Enter
            </Button>
          </div>

          {showFoodItem ? <FoodItem restaurantname={searchValue} /> : ""}
        </Grid>
      </Grid>
    </div>
  );
};

export default CustomerSearch;
