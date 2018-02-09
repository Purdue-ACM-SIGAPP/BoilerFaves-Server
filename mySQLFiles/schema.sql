create database boilerfaves
use boilerfaves;

CREATE TABLE foods
(
    id INTEGER AUTO_INCREMENT PRIMARY,
    name TEXT NOT NULL,
    isVegetarian BOOLEAN NOT NULL,
    PRIMARY KEY(id)
) 