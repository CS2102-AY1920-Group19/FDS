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
    FOREIGN KEY (ItemID) REFERENCES FoodItem on delete cascade
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
    FOREIGN KEY (ItemID) REFERENCES FoodItem on delete cascade
);

CREATE TABLE Inventory (
    itemid integer,
    amt_available integer,
    available boolean default TRUE,
    PRIMARY KEY (itemid),
    FOREIGN KEY (itemid) REFERENCES fooditem on delete cascade
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

create table restaurantpromotion (
    promotionid integer unique references promotion on delete cascade,
    resid integer references restaurant on delete cascade,
    primary key (promotionid, resid)
);

create table fdspromotion (
    promotionid integer unique references promotion on delete cascade,
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
    StartTime TIMESTAMP,
    EndTime TIMESTAMP,
    PRIMARY KEY (Id, StartTime, EndTime),
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
    Cost INTEGER REFERENCES FoodItem,
    FoodFee INTEGER,
    PRIMARY KEY (orderid, ItemID),
    FOREIGN KEY (ItemID) REFERENCES FoodItem on delete set null, 
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

---salary stores numbers only, only computed in query
CREATE TABLE Salary (
    Id INTEGER,
    TotalJourney INTEGER DEFAULT 0,
    Comission INTEGER,
    BaseSalary INTEGER,
    StartDate TIMESTAMP,
    EndDate TIMESTAMP,
    TotalSalary INTEGER DEFAULT 0,
    PRIMARY KEY (Id, StartDate, EndDate),
    FOREIGN KEY (Id) REFERENCES Rider ON DELETE CASCADE
);

CREATE TABLE Receipt (
    orderid integer,
    promotionid INTEGER,
    PercentageOff INTEGER DEFAULT 0,
    GainedPoints INTEGER, 
    UsedPoints INTEGER DEFAULT 0,
    DeliveryFee INTEGER,
    FoodFee INTEGER,
    TotalFee NUMERIC,
    PRIMARY KEY (orderid),
    foreign key (orderid) references orders
);

--rating for RIDERS
CREATE TABLE Rates (
    OrderID INTEGER,
    Rating INTEGER CHECK ((Rating >= 0) and (Rating <= 5)),
    PRIMARY KEY (OrderID),
    FOREIGN KEY (OrderID) REFERENCES Delivers 
);

--review FOOD
CREATE TABLE Reviews (
    orderid integer,
    ItemID INTEGER,
    Rating INTEGER CHECK ((Rating >= 0) and (Rating <= 5)),
    Review VARCHAR(200),
    PRIMARY KEY (orderid, ItemID),
    foreign key (orderid) references orders, 
    FOREIGN KEY (ItemID) REFERENCES FoodItem on delete set null
);

-- need here to update inventory value when seeding
CREATE OR REPLACE FUNCTION inventory_check() 
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amt_available > 0 THEN
        NEW.available = TRUE;
    END IF;
    IF NEW.amt_available = 0 THEN
        NEW.available = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_check_trigger
    BEFORE INSERT OR UPDATE
    ON Inventory
    FOR EACH ROW
    EXECUTE FUNCTION inventory_check()
;

-- need here to calculate contains foodfee when seeding
CREATE OR REPLACE FUNCTION contains_calculate() 
    RETURNS TRIGGER AS $$
BEGIN
    NEW.FoodFee = NEW.Quantity*NEW.Cost;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contains_check_trigger
    BEFORE INSERT OR UPDATE
    ON Contains 
    FOR EACH ROW
    EXECUTE FUNCTION contains_calculate()
;

-- need here to update salary value when seeding
CREATE OR REPLACE FUNCTION salary_update() 
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE Salary S
        SET TotalJourney = S.TotalJourney + 1, 
            TotalSalary = S.BaseSalary + ((S.TotalJourney + 1)*S.Comission)
        WHERE NEW.OrderId IN (
            SELECT O.OrderID
            FROM Orders O
            WHERE date_part('month', O.ordered_on) = date_part('month', S.StartDate)
            AND date_part('year', O.ordered_on) = date_part('year', S.StartDate)
        )
        AND Id = NEW.Id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER salary_update_trigger
    AFTER INSERT
    ON Delivers
    FOR EACH ROW
    EXECUTE FUNCTION salary_update()
;

-- put here to update receipt values when seeding
CREATE OR REPLACE FUNCTION receipt_check() 
    RETURNS TRIGGER AS $$
BEGIN
    NEW.percentageoff = case
        when NEW.promotionid is not null then (SELECT p.percentageoff from promotion p where p.promotionid = new.promotionid)
        else 0 
        end;
    NEW.deliveryfee = case 
        when NEW.promotionid is not null then case 
            when ((select p.freedelivery from promotion p where p.promotionid = new.promotionid) = true) or (NEW.usedpoints > 0) then 0
            else NEW.deliveryfee
            end
        when NEW.usedpoints > 0 then 0
        else NEW.deliveryfee
        end;
    NEW.TotalFee = Round(((NEW.DeliveryFee + NEW.FoodFee) * ((100 - NEW.PercentageOff)/100.0)), 2);
    NEW.gainedpoints = NEW.foodfee;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER receipt_check_trigger
    BEFORE INSERT OR UPDATE
    ON Receipt 
    FOR EACH ROW
    EXECUTE FUNCTION receipt_check()