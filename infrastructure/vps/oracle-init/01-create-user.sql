-- Atlantic Proxy Oracle Database Initialization
-- Create user and schema for Atlantic Proxy

-- Connect to PDB
ALTER SESSION SET CONTAINER = XEPDB1;

-- Create Atlantic Proxy user
CREATE USER atlantic_user IDENTIFIED BY "AtlanticProxy2024!";

-- Grant necessary privileges
GRANT CONNECT, RESOURCE TO atlantic_user;
GRANT CREATE SESSION TO atlantic_user;
GRANT CREATE TABLE TO atlantic_user;
GRANT CREATE SEQUENCE TO atlantic_user;
GRANT CREATE VIEW TO atlantic_user;
GRANT CREATE PROCEDURE TO atlantic_user;
GRANT UNLIMITED TABLESPACE TO atlantic_user;

-- Grant additional privileges for application
GRANT CREATE ANY INDEX TO atlantic_user;
GRANT ALTER ANY TABLE TO atlantic_user;
GRANT SELECT ANY TABLE TO atlantic_user;

-- Create tablespace for Atlantic Proxy (optional but recommended)
CREATE TABLESPACE atlantic_data
DATAFILE '/opt/oracle/oradata/XE/XEPDB1/atlantic_data01.dbf'
SIZE 100M
AUTOEXTEND ON
NEXT 10M
MAXSIZE 1G;

-- Assign tablespace to user
ALTER USER atlantic_user DEFAULT TABLESPACE atlantic_data;

-- Verify user creation
SELECT username, default_tablespace, account_status 
FROM dba_users 
WHERE username = 'ATLANTIC_USER';

-- Show connection info
SELECT 'Atlantic Proxy Oracle setup completed' as status FROM dual;