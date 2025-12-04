-- user: ktinventory
-- pwd: Keefe!2024!Invent
-- User types: 0 - Aproval required, 1 - Aproved student, 2 - Teacher
USE ktinventory;
DROP TABLE IF EXISTS users ;
DROP TABLE IF EXISTS idClass;
DROP TABLE IF EXISTS takenTool;
DROP TABLE IF EXISTS toolHistory;
DROP TABLE IF EXISTS tool;
DROP TABLE IF EXISTS materialHistory;
DROP TABLE IF EXISTS material;

CREATE TABLE users(
    userid VARCHAR(100) not null,
    displayName VARCHAR(20) not null,
    email VARCHAR(50) not null unique,
    hashPass VARCHAR(96) not null,
    userType int not null,
    classId int,
    id int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(id)
);vscode-file://vscode-app/c:/Users/oliver/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-browser/workbench/workbench.html

CREATE TABLE idClass(
    className VARCHAR(50) not null,
    classId int NOT NULL AUTO_INCREMENT,
    PRIMARY KEY(classId)
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


CREATE TABLE material(
    materialName VARCHAR(50) not null,
    materialTypeId int not null AUTO_INCREMENT,
    PRIMARY KEY(materialTypeId)
);

CREATE TABLE materialHistory(
    materialTypeId int not null,
    accountId int not null,
    timeTaken DATETIME not null,
    amountTaken int not null,
    constraint materialTypeConstraint1
    foreign key (materialTypeId) references material(materialTypeId) on delete cascade,
    constraint materialHistoryAccount
    foreign key (accountId) references users(id) on delete cascade,
    PRIMARY KEY(materialTypeId, accountId, timeTaken)
);