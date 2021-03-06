import React, { useState } from "react";
import clsx from "clsx";
import PerfectScrollbar from "react-perfect-scrollbar";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@material-ui/core";
import EditFood from "./EditFood";
//import mockData from "./data";
import FoodItemInfo from './FoodItemInfo';

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0,
  },
  inner: {
    minWidth: 800,
  },
  statusContainer: {
    display: "flex",
    alignItems: "center",
  },
  status: {
    marginRight: theme.spacing(1),
  },
  actions: {
    justifyContent: "flex-end",
  },
}));

const FoodItem = (props) => {
  const { className, ...rest } = props;

  const classes = useStyles();

  const [orders] = useState(props.data);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState("");

  const [menu] = useState(props.menu);


  const handleClick = (orders) => {
    setEditData(orders);
    setOpenEdit(true);
  };

  const handleEdit = () => {
    setOpenEdit(!openEdit);
  };

  // QUERY: DELETE
  const handleDelete = (fid) => {
    console.log(fid);
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader title="Food Items" />
      <Divider />
      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* <TableCell>Food Item ID</TableCell> */}
                  <TableCell>Item Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Amt in Inventory</TableCell>
                  <TableCell>Qty Limit</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell>Availability</TableCell>
                  <TableCell>Edit</TableCell>
                  <TableCell>Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.menu.map((item, index) => (
                  <FoodItemInfo key={index} itemid={item} />
                ))}
              </TableBody>
            </Table>
          </div>
          {openEdit && <EditFood data={editData} onClick={handleEdit} />}
        </PerfectScrollbar>
      </CardContent>
      <Divider />
    </Card>
  );
};

FoodItem.propTypes = {
  className: PropTypes.string,
};

export default FoodItem;
