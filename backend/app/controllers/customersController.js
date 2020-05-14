import moment from 'moment';

import dbQuery from '../db/dev/dbQuery';

import {
    hashPassword,
    comparePassword,
    isValidEmail,
    validatePassword,
    isEmpty,
} from '../helpers/validations';
  
import {
    errorMessage, successMessage, status,
} from '../helpers/status';
import { json } from 'body-parser';

/**
   * Create A Customer
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object (of Customer)
   */
  const createCustomer = async (req, res) => {
    const {
      email, first_name, last_name, password,
    } = req.body;

    console.log('body: ', req.body)
    console.log('email: ', email)
    console.log('first_name: ', first_name)
    console.log('last_name: ', last_name)
    console.log('password: ', password)


    // const created_on = moment(new Date());
    if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
      errorMessage.error = 'Email, password, first name and last name fields cannot be empty';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!validatePassword(password)) {
      errorMessage.error = 'Password must be more than five(5) characters';
      return res.status(status.bad).send(errorMessage.error);
    }
    // const hashedPassword = hashPassword(password);
    const createCustomerQuery = `INSERT INTO
        Customer(email, first_name, last_name, password)
        VALUES($1, $2, $3, $4)
        returning *`;
    // const values = [
    //   email,
    //   first_name,
    //   last_name,
    //   hashedPassword,
    //   // created_on,
    // ];

    const values = [
      email,
      first_name,
      last_name,
      password,
      // created_on,
    ];
  
    try {
      const { rows } = await dbQuery.query(createCustomerQuery, values);
      const dbResponse = rows[0];
      // delete dbResponse.password;
    //   const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      successMessage.data = dbResponse;
    //   successMessage.data.token = token;
      return res.status(status.created).send(successMessage.data);
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        errorMessage.error = 'Customer with that EMAIL already exist';
        return res.status(status.conflict).send(errorMessage.error);
      }
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };
  
  /**
     * Signin
     * @param {object} req
     * @param {object} res
     * @returns {object} customer object
     */
  const signinCustomer = async (req, res) => {
    const { email, password, firstname, lastname, creditcard } = req.body;
    if (isEmpty(email) || isEmpty(password)) {
      errorMessage.error = 'Email or Password detail is missing';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email or Password';
      return res.status(status.bad).send(errorMessage.error);
    }
    const signinCustomerQuery = 'SELECT * FROM Customer WHERE email = $1';
    try {
      const { rows } = await dbQuery.query(signinCustomerQuery, [email]);
      const dbResponse = rows[0];
      if (!dbResponse) {
        errorMessage.error = 'Customer with this email does not exist';
        console.log(errorMessage.error);
        return res.status(status.notfound).send(errorMessage.error);
      }
      if (!comparePassword(dbResponse.password, password)) {
        errorMessage.error = 'The password you provided is incorrect';
        return res.status(status.bad).send(errorMessage.error);
      }
      // const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      // delete dbResponse.password;
      successMessage.data = dbResponse;
    //   successMessage.data.token = token;
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };

  /**
 * @params {Object} req
 * @params {Object} res
 * @returns return firstname and Lastname
 */ 

 const searchCustomerFirstnameOrLastname = async (req, res) => {
    const { first_name, last_name } = req.query;
    const searchQuery = 'SELECT * from Customer WHERE first_name =$1 OR last_name =$2 ORDER BY id DESC';
    try {
      const { rows } = await dbQuery.query(searchQuery, [first_name, last_name]);
      const dbResponse = rows;
      if (!dbResponse[0]) {
        errorMessage.error = 'No user with such names';
        return res.status(status.notfound).send(errorMessage.error);
      }
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage.data);
    }
    catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);

    }
  };

  /**
   * Edit A Customer
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object (of Customer)
   */
  const editCustomer = async (req, res) => {
    const {
      email, first_name, last_name, password, id, creditcard
    } = req.body;

    console.log('body: ', req.body)
    console.log('email: ', email)
    console.log('first_name: ', first_name)
    console.log('last_name: ', last_name)
    console.log('password: ', password)
    console.log('id: ', id)

    // const created_on = moment(new Date());
    // if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
    //   errorMessage.error = 'Email, password, first name and last name fields cannot be empty';
    //   return res.status(status.bad).send(errorMessage.error);
    // }
    if (isEmpty(email) || isEmpty(first_name) || isEmpty(last_name) || isEmpty(password)) {
      errorMessage.error = 'Email, password, first name and last name fields cannot be empty';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!isValidEmail(email)) {
      errorMessage.error = 'Please enter a valid Email';
      return res.status(status.bad).send(errorMessage.error);
    }
    if (!validatePassword(password)) {
      errorMessage.error = 'Password must be more than five(5) characters';
      return res.status(status.bad).send(errorMessage.error);
    }
    // const hashedPassword = hashPassword(password);
    const editCustomerQuery = `UPDATE Customer set
        email = $1,
        first_name = $2,
        last_name = $3,
        password = $4,
        ccid = $6
        where id = $5
        returning *`;
    const values = [
      email,
      first_name,
      last_name,
      password,
      id,
      creditcard
      // creditcard
      // created_on,
    ];
  
    try {
      const { rows } = await dbQuery.query(editCustomerQuery, values);
      const dbResponse = rows[0];
      // delete dbResponse.password;
    //   const token = generateUserToken(dbResponse.email, dbResponse.id, dbResponse.is_admin, dbResponse.first_name, dbResponse.last_name);
      successMessage.data = dbResponse;
    //   successMessage.data.token = token;
      return res.status(status.created).send(successMessage.data);
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        errorMessage.error = 'Customer with that EMAIL already exist';
        return res.status(status.conflict).send(errorMessage.error);
      }
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };

  /**
   * remove cc details in customer
   */
  const deleteCreditCard = async (req, res) => {
    const { id } = req.body;
    const deleteCustomerQuery = 'update customer set ccid = null where id = $1 returning *';
    try {
      const { rows } = await dbQuery.query(deleteCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };
  

  /**
   * delete a customer
   */
  const deleteCustomer = async (req, res) => {
    const { id } = req.body;
    const deleteCustomerQuery = 'delete from customer where id = $1 returning *';
    try {
      const { rows } = await dbQuery.query(deleteCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  };

  /**
   * get no. of customer's orders
   */
  const ordersByCustomer = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const ordersByCustomerQuery = 'select count(id) from orders where id = $1';
    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get promotion that applies to customer's orders
   */
  const applicablePromotions = async (req, res) => {
    const { id, total } = req.body;
    console.log('id: ', id);
    const applicablePromotionsQuery = 'select * from promotion where (enddate > now()) and (promotionid = any(select promotionid from fdspromotion) or promotionid = any(select promotionid from restaurantpromotion where resid = $1)) and (minspending <= $2)';
    
    const values = [
      id,
      total
    ];

    try {
      const { rows } = await dbQuery.query(applicablePromotionsQuery, values);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      console.log('owowowowow: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get promotion details
   */
  const promotionDetails = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const applicablePromotionsQuery = 'select * from promotion where promotionid = $1';

    try {
      const { rows } = await dbQuery.query(applicablePromotionsQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * new order from customer
   */
  const createOrder = async (req, res) => {
    const { id, ccpayment, items } = req.body;
    console.log('id: ', id);
    const createOrderQuery = 'insert into orders(id, ccpayment) valuse($1,$2) returning *';
    const values = [
      id,
      ccpayment
    ];

    try {
      const { rows } = await dbQuery.query(createOrderQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get all orders by customer
   */
  const customerOrders = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const ordersByCustomerQuery = 'select * from orders where id = $1';
    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      if (!dbResponse) {
        return res.status(status.success).send("hello (:");
      }
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get customer order receipt
   */
  const orderReceipt = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const ordersByCustomerQuery = 'select * from receipt where orderid = $1';
    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      if (!dbResponse) {
        return res.status(status.success).send("hello (:");
      }
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get customer order information
   */
  const orderInformation = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const ordersByCustomerQuery = 'select * from orders where orderid = $1';
    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get customer food
   */
  const orderFood = async (req, res) => {
    const { id } = req.body;
    console.log('id: ', id);
    const ordersByCustomerQuery = 'select * from contains where orderid = $1';
    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get order restaurant
   */
  const orderRestaurant = async (req, res) => {
    const { id } = req.body;
    console.log('oopsie: ', id);
    const ordersByCustomerQuery = 'select resname from restaurant where resid = (select distinct resid from listings where itemid = any(select itemid from contains where orderid = $1))';
    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('oopsie res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * rate a delivery
   */
  const rateDelivery = async (req, res) => {
    const { id, value } = req.body;
    console.log('order restaurant id: ', id);
    const ordersByCustomerQuery = 'insert into rates(orderid, rating) values($1, $2) returning *';
    const values = [
      id, 
      value
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get delivery rating
   */
  const getRating = async (req, res) => {
    const { id } = req.body;
    console.log('order restaurant id: ', id);
    const ordersByCustomerQuery = 'select * from rates where orderid = $1';

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * delete rating
   */
  const deleteRating = async (req, res) => {
    const { id } = req.body;
    console.log('order restaurant id: ', id);
    const ordersByCustomerQuery = 'delete from rates where orderid = $1 returning *';

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }
  
  /**
   * edit rating
   */
  const editRating = async (req, res) => {
    const { id, value } = req.body;
    console.log('order restaurant id: ', id);
    const ordersByCustomerQuery = 'update rates set rating = $2 where orderid = $1 returning *';
    const values = [
      id, 
      value
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * rating count
   */
  const getRatingCount = async (req, res) => {
    const { id } = req.body;
    console.log('test???? order restaurant id: ', id);
    const ordersByCustomerQuery = 'select count(orderid) from rates where orderid = $1';

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get food names of order
   */
  const getOrderItemNames = async (req, res) => {
    const { id } = req.body;
    console.log('order restaurant id: ', id);
    const ordersByCustomerQuery = 'select itemid, itemname from fooditem where itemid = any(select itemid from contains where orderid = $1)';

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * review a order item
   */
  const reviewItem = async (req, res) => {
    const { orderid, itemid, rating, review } = req.body;
    console.log('order restaurant id: ', req.body);
    const ordersByCustomerQuery = 'insert into reviews(orderid, itemid, rating, review) values($1, $2, $3, $4) returning *';
    const values = [
      orderid,
      itemid,
      rating,
      review
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get order food item review
   */
  const getReview = async (req, res) => {
    const { orderid, itemid } = req.body;
    console.log('order restaurant id: ', req.body);
    const ordersByCustomerQuery = 'select * from reviews where orderid = $1 and itemid = $2;';
    const value = [
      orderid,
      itemid
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, value);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * delete review
   */
  const deleteReview = async (req, res) => {
    const { orderid, itemid } = req.body;
    console.log('order restaurant id: ', req.body);
    const ordersByCustomerQuery = 'delete from reviews where orderid = $1 and itemid = $2 returning *';
    const value = [
      orderid,
      itemid
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, value);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }
  
  /**
   * edit review
   */
  const editReview = async (req, res) => {
    const { rating, review, orderid, itemid } = req.body;
    console.log('order restaurant id: ', req.body);
    const ordersByCustomerQuery = 'update reviews set rating = $1, review = $2 where orderid = $3 and itemid = $4 returning *';
    const values = [
      rating,
      review,
      orderid, 
      itemid,
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, values);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', dbResponse);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * review count
   */
  const getReviewCount = async (req, res) => {
    const { orderid, itemid } = req.body;
    console.log('error body: ', req.body);
    console.log('error orderid: ', orderid);
    console.log('error itemid: ', itemid);
    const ordersByCustomerQuery = 'select count(itemid) from reviews where itemid = $2 and orderid = $1';
    const value = [
      orderid,
      itemid
    ]

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, value);
      const dbResponse = rows[0];
      successMessage.data = dbResponse;
      console.log('res: ', rows);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * get up to 5 recent address
   */
  const getRecentAddress = async (req, res) => {
    const { id } = req.body;
    console.log('error body: ', req.body);
    const ordersByCustomerQuery = 'select addressdetails from orderdetails where orderid = any(select orderid from orders where id = $1 order by ordered_on desc) limit 5';

    try {
      const { rows } = await dbQuery.query(ordersByCustomerQuery, [id]);
      const dbResponse = rows;
      successMessage.data = dbResponse;
      if (!dbResponse) {
        errorMessage.error = 'Customer does not have any recent address saved in the system.';
        console.log(errorMessage.error);
        return res.status(status.notfound).send(errorMessage.error);
      }
      console.log('res: ', rows);
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      console.log(error);
      errorMessage.error = 'Operation was not successful';
      return res.status(status.error).send(errorMessage.error);
    }
  }

  /**
   * new order
   */
  const newOrder = async (req, res) => {
    const {
      id, cc, address, delivery, usedpoints, subtotal, promo, cart, current
    } = req.body;

    console.log('body: ', req.body)

    const query1 = `INSERT INTO
        orders(id, ccpayment)
        VALUES($1, $2)
        returning *`;
    const query2 = 'insert into receipt(orderid,promotionid,usedpoints,deliveryfee,foodfee) values($1,$2,$3,$4,$5) returning *'
    const query3 = 'insert into orderdetails(orderid,addressdetails) values($1,$2) returning *'
    const query4 = 'insert into contains(orderid, itemid, quantity,cost,foodfee) values($1,$2,$3,$4,$5) returning *'
    const query5 = 'update customer set points = $1 where id = $2'
    const values5 = [
      subtotal - usedpoints,
      id
    ]
    var nett = current + (subtotal - usedpoints);
   
    const values1 = [
      id,
      cc
    ];
    try {
      await dbQuery.query('begin')
      const { rows } = await dbQuery.query(query1, values1);
      const orderid = rows[0].orderid;
      const values2 = [
        orderid,
        promo,
        usedpoints,
        delivery,
        subtotal
      ]
      const values3 = [
        orderid,
        address
      ]
      await dbQuery.query(query2, values2);
      await dbQuery.query(query3, values3);
      for (var i = 0; i < cart.length; i++) {
        const values4 = [
          orderid,
          cart[i].itemid,
          cart[i].qty,
          cart[i].price,
          cart[i].subtotal
        ]
        await dbQuery.query(query4, values4);
        await dbQuery.query(query5, values5)
      }
      await dbQuery.query('commit');
      // delete dbResponse.password;
      successMessage.data = orderid;
      return res.status(status.success).send(successMessage.data);
    } catch (error) {
      await dbQuery.query('rollback');
      errorMessage.error = 'Operation was not successful';
      console.log('error: ', error);
      return res.status(status.success).send(errorMessage.error);
    }
  };

  
  export {
    createCustomer,
    signinCustomer,
    searchCustomerFirstnameOrLastname,
    editCustomer,
    deleteCustomer,
    ordersByCustomer,
    applicablePromotions,
    promotionDetails,
    customerOrders,
    orderReceipt,
    orderInformation,
    orderFood,
    orderRestaurant,
    rateDelivery,
    getRating,
    deleteRating,
    editRating,
    getRatingCount,
    getOrderItemNames,
    reviewItem,
    getReview,
    deleteReview,
    editReview,
    getReviewCount,
    deleteCreditCard,
    getRecentAddress,
    newOrder
  };
