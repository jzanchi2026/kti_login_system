CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT, userid VARCHAR(100), displayName VARCHAR(100), email VARCHAR(320), password VARCHAR(96), PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS aproval(id int AUTO_INCREMENT, userid VARCHAR(100), displayName VARCHAR(100), email VARCHAR(320), password VARCHAR(96), PRIMARY KEY (id));
ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'pass'; 
flush privileges;