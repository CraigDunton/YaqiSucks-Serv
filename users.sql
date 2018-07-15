/*DROP DATABASE IF EXISTS app;
CREATE DATABASE app;

\c app
*/
CREATE EXTENSION citext;

CREATE TABLE orgs (
  ID SERIAL PRIMARY KEY,
  name VARCHAR,
  code CITEXT UNIQUE
);

CREATE TABLE users (
  ID SERIAL PRIMARY KEY,
  fName VARCHAR,
  lName VARCHAR,
  email VARCHAR,
  pw    VARCHAR,
  phone VARCHAR,
  sched VARCHAR,
  orgCode CITEXT REFERENCES orgs (code)
);

CREATE TABLE users_orgs (
  uid integer REFERENCES users (ID),
  orgCode CITEXT REFERENCES orgs (code)
);

CREATE TABLE users_meeting (
  uid integer REFERENCES users (ID),
  mid integer REFERENCES users (ID)
);

CREATE TABLE users_met (
  uid integer REFERENCES users (ID),
  mid integer REFERENCES users (ID)
);

INSERT INTO orgs (name, code)
  VALUES ('Accounting','accrox');

INSERT INTO users (fName,lName,email,pw,phone,sched,orgCode)
  VALUES ('Craig','Dunton','craig@email.com','password','330-420-1337','1010101','accrox');
INSERT INTO users (fName,lName,email,pw,phone,sched,orgCode)
  VALUES ('Craig','Matched_With','craig@bmail.com','password','330-420-1337','1010101','accrox');
INSERT INTO users (fName,lName,email,pw,phone,sched,orgCode)
  VALUES ('Craig','NOT_matched_With','craig@cmail.com','password','330-420-1337','1010101','accrox');
INSERT INTO users (fName,lName,email,pw,phone,sched,orgCode)
  VALUES ('Craig','Meeting_With','craig@dmail.com','password','330-420-1337','1010101','accrox');
INSERT INTO users (fName,lName,email,pw,phone,sched,orgCode)
  VALUES ('Craig','NOT_matched_With_2','craig@cdmail.com','password','330-420-1337','1010101','accrox');

INSERT INTO users_met (uid, mid)
  VALUES (1, 2);

INSERT INTO users_meeting (uid, mid)
  VALUES (1, 4);
