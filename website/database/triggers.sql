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
FOR EACH ROW EXECUTE FUNCTION fn_enforce_event_date_order();

-- -------------------------------------------------------------
-- Auto-update professional rating on review insert/update/delete
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_professional_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_professional_id INT;
BEGIN
    -- Determine which professional_id to update
    IF TG_OP = 'DELETE' THEN
        v_professional_id := OLD.professional_id;
    ELSE
        v_professional_id := NEW.professional_id;
    END IF;
 
    UPDATE professional_profile
    SET rating = (
        SELECT ROUND(AVG(rating))
        FROM professional_review
        WHERE professional_id = v_professional_id
    )
    WHERE user_id = v_professional_id;
 
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_update_professional_rating
AFTER INSERT OR UPDATE OR DELETE ON professional_review
FOR EACH ROW EXECUTE FUNCTION fn_update_professional_rating();
    
-- -------------------------------------------------------------
-- Block applications to past events
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_block_application_past_event()
RETURNS TRIGGER AS $$
DECLARE
    v_sdate DATE;
BEGIN
    SELECT sdate INTO v_sdate FROM events WHERE id = NEW.event_id;
 
    IF v_sdate < CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot apply to event % because its start date (%) has already passed.', NEW.event_id, v_sdate;
    END IF;
 
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_block_application_past_event
BEFORE INSERT ON application
FOR EACH ROW EXECUTE FUNCTION fn_block_application_past_event();


-- -------------------------------------------------------------
-- Block publisher applying to own event
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_block_self_application()
RETURNS TRIGGER AS $$
DECLARE 
    v_publisher_id INT;
BEGIN
    SELECT publisher_id INTO v_publisher_id FROM professional_profile WHERE id = NEW.event_id;

    IF v_publisher_id == NEW.publisher_id THEN
        RAISE EXCEPTION 'Professional % cannot apply to their own event (%).', NEW.publisher_id, NEW.event_id;
    END IF;

    RETURN NEW;
END; 
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_block_self_application
BEFORE INSERT ON application
FOR EACH ROW EXECUTE FUNCTION fn_block_self_application();
