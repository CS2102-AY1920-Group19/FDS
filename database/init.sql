DROP TABLE IF EXISTS FoodItem CASCADE;
DROP TABLE IF EXISTS Restaurant CASCADE;
DROP TABLE IF EXISTS Listings CASCADE;
DROP TABLE IF EXISTS Category CASCADE;
DROP TABLE IF EXISTS Classifies CASCADE;
DROP TABLE IF EXISTS Inventory CASCADE;
DROP TABLE IF EXISTS Staff CASCADE;
DROP TABLE IF EXISTS Manager CASCADE;
DROP TABLE IF EXISTS Promotion CASCADE;
DROP TABLE IF EXISTS restaurantpromotion CASCADE;
DROP TABLE IF EXISTS fdspromotion CASCADE;
DROP TABLE IF EXISTS Rider CASCADE;
DROP TABLE IF EXISTS PartTime CASCADE;
DROP TABLE IF EXISTS FullTime CASCADE;
DROP TABLE IF EXISTS Shifts CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;
DROP TABLE IF EXISTS OrderDetails CASCADE;
DROP TABLE IF EXISTS Contains CASCADE;
DROP TABLE IF EXISTS Journey CASCADE;
DROP TABLE IF EXISTS Delivers CASCADE;
DROP TABLE IF EXISTS Receipt CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Rates CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Salary CASCADE;

CREATE TABLE FoodItem (
    ItemID SERIAL,
    itemname varchar(50),
    Cost INTEGER,
    MaxLimit INTEGER,
    PRIMARY KEY (ItemID)
);

CREATE TABLE Restaurant (
    ResID SERIAL,
    ResName VARCHAR(100) unique,
    MinSpending INTEGER,
    joined_at timestamp default now(),
    PRIMARY KEY (ResID)
);

CREATE TABLE Listings (
    ResID INTEGER,
    ItemID INTEGER,
    PRIMARY KEY (ResID, ItemID),
    FOREIGN KEY (ResID) REFERENCES Restaurant on delete cascade,
    FOREIGN KEY (ItemID) REFERENCES FoodItem
);

CREATE TABLE Category (
    catid serial,
    CategoryName VARCHAR(20),
    PRIMARY KEY (catid)
);

CREATE TABLE Classifies (
    catid integer,
    ItemID INTEGER,
    PRIMARY KEY (catid, ItemID),
    FOREIGN KEY (catid) REFERENCES Category,
    FOREIGN KEY (ItemID) REFERENCES FoodItem
);

CREATE TABLE Inventory (
    itemid integer,
    amt_available integer,
    available boolean default TRUE, /* add trigger to update this boolean whenever amt available change */
    PRIMARY KEY (itemid),
    FOREIGN KEY (itemid) REFERENCES fooditem
);

CREATE TABLE Staff (
    Id SERIAL,
    RestaurantId INTEGER not null,
    email VARCHAR(100) unique NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (Id, RestaurantId),
    FOREIGN KEY (RestaurantID) REFERENCES Restaurant on delete cascade
);

CREATE TABLE Manager (
    Id SERIAL,
    email VARCHAR(100) unique NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password VARCHAR(100) NOT NULL,
    PRIMARY KEY (Id)
);

CREATE TABLE Promotion (
    PromotionID SERIAL,
    MinSpending INTEGER default 0,
    PercentageOff INTEGER default 0,
    freedelivery boolean default false,
    DateEntered TIMESTAMP DEFAULT now(),
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    PRIMARY KEY (PromotionID)
);

CREATE OR REPLACE FUNCTION promotion_date_check() 
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.Startdate > NEW.endDate THEN
        RAISE EXCEPTION 'Start date cannot be after end date!';
    END IF;
    IF NEW.Startdate < NEW.DateEntered THEN
        RAISE EXCEPTION 'Start date cannot be before today!';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promotion_date_trigger
    BEFORE INSERT OR UPDATE
    ON Promotion
    FOR EACH ROW
    EXECUTE FUNCTION promotion_date_check()
;

INSERT INTO Promotion VALUES (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 
    DEFAULT, now(), '2020-09-28 01:00:00');



create table restaurantpromotion (
    promotionid integer unique references promotion on delete cascade,
    resid integer references restaurant on delete cascade,
    primary key (promotionid, resid)
);

create table fdspromotion (
    promotionid integer unique references promotion,
    managerid integer references Manager,
    primary key (promotionid, managerid)
);


CREATE TABLE Rider (
    Id SERIAL,
    email varchar(100) unique not null,
    first_name varchar(100),
    last_name varchar(100),
    password varchar(100) not null,
    PRIMARY KEY (Id)
);

CREATE TABLE PartTime (
    Id INTEGER,
    PRIMARY KEY (Id),
    FOREIGN KEY (Id) REFERENCES Rider on delete cascade
);

CREATE TABLE FullTime (
    Id INTEGER,
    PRIMARY KEY (Id),
    FOREIGN KEY (Id) REFERENCES Rider on delete cascade
);

CREATE TABLE Shifts (
    Id INTEGER,
    ShiftID SERIAL,
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP NOT NULL,
    PRIMARY KEY (ShiftID, Id),
    FOREIGN KEY (Id) REFERENCES Rider ON DELETE CASCADE
);

CREATE TABLE Customer (
    Id SERIAL,
    email varchar(100) unique not null,
    first_name varchar(100),
    last_name varchar(100),
    password varchar(100) not null,
    Points INTEGER default 0,
    CCID INTEGER,
    joined_at timestamp default now(),
    PRIMARY KEY (Id)
);

CREATE TABLE Orders (
    OrderID SERIAL,
    ordered_on timestamp default now(),
    Id INTEGER REFERENCES Customer on delete set null, 
    ccpayment boolean, 
    PRIMARY KEY (OrderID)
);

CREATE TABLE OrderDetails (
    OrderID integer,
    AddressDetails VARCHAR(60) NOT NULL,
    PRIMARY KEY (OrderID),
    foreign key (orderid) references orders
);

CREATE TABLE Contains (
    orderid integer,
    ItemID INTEGER,
    Quantity INTEGER,
    FoodFee INTEGER,
    PRIMARY KEY (orderid, ItemID),
    FOREIGN KEY (ItemID) REFERENCES FoodItem,
    foreign key (orderid) references orders
);

CREATE TABLE Journey (
    orderid integer,
    OrderedOn TIMESTAMP NOT NULL,
    RiderStartsJourney TIMESTAMP NOT NULL,
    RiderArrivesAtRes TIMESTAMP NOT NULL,
    RiderDepartsToCust TIMESTAMP NOT NULL,
    DeliversFood TIMESTAMP NOT NULL,
    PRIMARY KEY (orderid),
    foreign key (orderid) references orders
);

CREATE TABLE Delivers (
    OrderID INTEGER,
    Id INTEGER,
    DeliveryFee INTEGER,
    PRIMARY KEY (OrderID), 
    FOREIGN KEY (OrderID) REFERENCES OrderDetails,
    FOREIGN KEY (Id) REFERENCES Rider on delete cascade
);

CREATE TABLE Receipt (
    orderid integer,
    GainedPoints INTEGER, 
    UsedPoints INTEGER,
    DeliveryFee INTEGER,
    FoodFee INTEGER,
    TotalFee INTEGER,
    PRIMARY KEY (orderid),
    foreign key (orderid) references orders
);

CREATE TABLE Rates (
    OrderID INTEGER,
    Rating INTEGER CHECK ((Rating >= 0) and (Rating <= 5)),
    PRIMARY KEY (OrderID),
    FOREIGN KEY (OrderID) REFERENCES Delivers 
);

CREATE TABLE Reviews (
    orderid integer,
    ItemID INTEGER,
    Rating INTEGER CHECK ((Rating >= 0) and (Rating <= 5)),
    Review VARCHAR(200),
    PRIMARY KEY (orderid, ItemID),
    foreign key (orderid) references orders, 
    FOREIGN KEY (ItemID) REFERENCES FoodItem 
);

---salary stores numbers only, only computed in query
CREATE TABLE Salary (
    Id INTEGER,
    Comission INTEGER,
    BaseSalary INTEGER,
    PRIMARY KEY (Id),
    FOREIGN KEY (Id) REFERENCES Rider --ON DELETE CASCADE
);