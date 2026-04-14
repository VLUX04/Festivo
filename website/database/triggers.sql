-- -------------------------------------------------------------
-- Prevent self-invites on professional_invite
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_prevent_self_invite()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sender_id = NEW.receiver_id THEN
        RAISE EXCEPTION 'A professional cannot invite themselves (sender_id = receiver_id = %).', NEW.sender_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_prevent_self_invite
BEFORE INSERT ON professional_invite
FOR EACH ROW EXECUTE FUNCTION fn_prevent_self_invite();

-- -------------------------------------------------------------
-- Enforce event date order (edate >= sdate)
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_enforce_event_date_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.edate < NEW.sdate THEN
        RAISE EXCEPTION 'Event end date (%) cannot be before start date (%).', NEW.edate, NEW.sdate;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql

CREATE TRIGGER trg_enforce_event_date_order
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION fn_enforce_event_date_order()
