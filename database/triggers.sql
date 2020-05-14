-- put here so wont affect seeding promotion
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
    BEFORE INSERT
    ON Promotion
    FOR EACH ROW
    EXECUTE FUNCTION promotion_date_check()
;

-- put here cos doesn't affect anything
CREATE OR REPLACE FUNCTION shift_check() 
    RETURNS TRIGGER AS $$
BEGIN
   IF ((select count(*) FROM Shifts GROUP BY StartTime LIMIT 1) < 5) THEN
        RAISE INFO 'There are less than five people working this shift';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shift_check_trigger
    AFTER INSERT
    ON Shifts
    FOR EACH ROW
    EXECUTE FUNCTION shift_check()
;

-- put here so won't affect seeding old orders and contains 
CREATE OR REPLACE FUNCTION inventory_contains_update() 
    RETURNS TRIGGER AS $$
BEGIN
    IF ((SELECT amt_available FROM Inventory I WHERE I.ItemID 
        = NEW.ItemID LIMIT 1) >= NEW.Quantity) THEN
        UPDATE Inventory I
        SET amt_available = I.amt_available - NEW.Quantity
        WHERE ItemID = NEW.ItemID;
    END IF;
    IF ((SELECT amt_available FROM Inventory I WHERE I.ItemID 
        = NEW.ItemID LIMIT 1) < NEW.Quantity) THEN
        NEW.Quantity = 0;
        RAISE EXCEPTION 'Item quantity exceeds limit.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_contains_update_trigger
    BEFORE INSERT
    ON Contains 
    FOR EACH ROW
    EXECUTE FUNCTION inventory_contains_update()
;