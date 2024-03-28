-- user: ktinventory
-- pwd: Keefe!2024!Invent
-- User types: 0 - Aproval required, 1 - Aproved student, 2 - Teacher
DROP DATABASE IF EXISTS ktinventory;
CREATE DATABASE ktinventory;
USE ktinventory;
CREATE TABLE users(
    userid VARCHAR(100) not null,
    displayName VARCHAR(20) not null,
    email VARCHAR(50) not null unique,
    hashPass VARCHAR(96) not null,
    userType int not null,
    classId int,
    id int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id)
);
CREATE TABLE idClass(
    className VARCHAR(50) not null,
    classId int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(classId)
);
CREATE TABLE material(
    materialName VARCHAR(50) not null,
    amount int not null,
    materialId int not null AUTO_INCREMENT,
    PRIMARY KEY(materialId)
);
CREATE TABLE tool(
    toolName VARCHAR(50) not null,
    toolTypeId int not null AUTO_INCREMENT,
    PRIMARY KEY(toolTypeId)
);
CREATE TABLE takenTool(
    toolTypeId int not null,
    accountId int,
    timeTaken DATETIME not null,
    toolId int not null AUTO_INCREMENT,
    constraint toolTypeConstraint1
    foreign key (toolTypeId) references tool(toolTypeId) on delete cascade,
    PRIMARY KEY(toolId)
);
CREATE TABLE toolHistory(
    toolTypeId int not null,
    accountId int not null,
    timeTaken DATETIME not null,
    expireTime DATETIME not null,
    toolId int not null, 
    constraint toolTypeConstraint2
    foreign key (toolTypeId) references tool(toolTypeId) on delete cascade,
    constraint toolHistoryAccount
    foreign key (accountId) references idAccount(id) on delete cascade,
    PRIMARY KEY(toolId)
);
CREATE TABLE materialHistory(
    amount int not null,
    accountId int not null,
    timeTaken DATETIME not null,
    expireTime DATETIME not null,
    materialId int not null,
    historyId int not null AUTO_INCREMENT,
    constraint materialConstraint
    foreign key (materialId) references material(materialId) on delete cascade,
    constraint materialHistoryAccount
    foreign key (accountId) references idAccount(id) on delete cascade,
    PRIMARY KEY(historyId)
);