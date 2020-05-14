import express from 'express';

import { createManager, signinManager, searchManagerFirstnameOrLastname, editManager, deleteManager,
    newrestaurantcount,
    newcustomercount,
    orderscount,
    totalfoodcost,
    totalnett,
    locations,
    locationsperhr,
    customerorderscount,
    customertotalfoodcost,
    customertotalnett,
    checkcustomerid ,
    customerorders,
    checkriderid,
    riderorders,
    newsalary,
    totaldelitime
} from '../controllers/managersController';

const router = express.Router();

// manager Routes

router.post('/auth/signup', createManager);
router.post('/auth/signin', signinManager);
router.get('/search', searchManagerFirstnameOrLastname);
router.post('/edit', editManager);
router.post('/delete', deleteManager);
router.post('/summary/restaurant/count', newrestaurantcount)
router.post('/summary/customer/count', newcustomercount)
router.post('/summary/orders/count', orderscount)
router.post('/summary/orders/foodcost', totalfoodcost)
router.post('/summary/orders/nett', totalnett)
router.post('/summary/locations', locations)
router.post('/summary/locations/hr', locationsperhr)
router.post('/summary/customer/orders', customerorderscount)
router.post('/summary/customer/foodcost', customertotalfoodcost)
router.post('/summary/customer/nett', customertotalnett)
router.post('/check/customer', checkcustomerid)
router.post('/check/rider', checkriderid)
router.post('/summary/rider/orderid', riderorders)
router.post('/rider/salary', newsalary)
router.post('/rider/totaldelitime', totaldelitime)

router.post('/summary/customer/orderid', customerorders)
export default router;