CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT, displayName VARCHAR(100), email VARCHAR(320), pic VARCHAR(100), PRIMARY KEY (id));
ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'pass'; 
flush privileges;