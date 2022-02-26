/*4 tables for market weekly/daily actual/predicted pork prices*/
DROP table IF EXISTS market.daily_cut_predicted;
DROP table IF EXISTS market.daily_cut_actual;
DROP table IF EXISTS market.weekly_cut_predicted;
DROP table IF EXISTS market.weekly_cut_actual;

/*remember that CREATE schema must use a 'BATCH' statement */
BEGIN; 
DROP SCHEMA IF EXISTS market CASCADE;
END;

BEGIN;
CREATE SCHEMA IF NOT EXISTS market;
END;

CREATE TABLE IF NOT EXISTS market.daily_cut_predicted (
    daily_cut_predicted_id SERIAL PRIMARY KEY,
    avg_cutout_carcass INT NOT NULL,
    avg_cutout_loin INT NOT NULL,
    avg_cutout_butt INT NOT NULL,
    avg_cutout_picnic INT NOT NULL,
    avg_cutout_rib INT NOT NULL,
    avg_cutout_ham INT NOT NULL,
    avg_cutout_belly INT NOT NULL,
    pounds INT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market.daily_cut_actual (
    daily_cut_actual_id SERIAL PRIMARY KEY,
    avg_cutout_carcass INT NOT NULL,
    avg_cutout_loin INT NOT NULL,
    avg_cutout_butt INT NOT NULL,
    avg_cutout_picnic INT NOT NULL,
    avg_cutout_rib INT NOT NULL,
    avg_cutout_ham INT NOT NULL,
    avg_cutout_belly INT NOT NULL,
    pounds INT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market.weekly_cut_predicted (
    weekly_cut_predicted_id SERIAL PRIMARY KEY,
    avg_cutout_carcass INT NOT NULL,
    avg_cutout_loin INT NOT NULL,
    avg_cutout_butt INT NOT NULL,
    avg_cutout_picnic INT NOT NULL,
    avg_cutout_rib INT NOT NULL,
    avg_cutout_ham INT NOT NULL,
    avg_cutout_belly INT NOT NULL,
    pounds INT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market.weekly_cut_actual (
    weekly_cut_actual_id SERIAL PRIMARY KEY,
    avg_cutout_carcass INT NOT NULL,
    avg_cutout_loin INT NOT NULL,
    avg_cutout_butt INT NOT NULL,
    avg_cutout_picnic INT NOT NULL,
    avg_cutout_rib INT NOT NULL,
    avg_cutout_ham INT NOT NULL,
    avg_cutout_belly INT NOT NULL,
    pounds INT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);