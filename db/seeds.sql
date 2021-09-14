-- SINCE ID IS AUTO_INCREMENT, THERE IS NO NEED TO ADD THE ID SECTION ON EACH TABLE
INSERT INTO department (name)
VALUES ('Restaraunt'),
       ('Clothing'),
       ('Pharmacy'),
       ('Electronics'),
       ('Accessories'),
       ('Pets');

INSERT INTO role (title, salary, department_id)
VALUES ('Server',           500,    1),
       ('Stocker',          450,    2),
       ('Chef',             50,     1),
       ('Groomer',          800,    6),
       ('Jeweler',          1000,   5),
       ('Technician',       2500,   4),
       ('Pharmacists',      6000,   3),
       ('Geek Squad',       950,    4),
       ('Tailor',           850,    2),
       ('Animal Handler',   1200,   6),
       ('Executive',        5000,   NULL);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('James',   'Lincoln',      1,   1),
       ('Tim',     'Tam',          2,   NULL),
       ('Jon',     'Jimbo',        3,   7),
       ('Zack',    'Zim',          4,   NULL),
       ('Lan',     'Limburger',    5,   NULL),
       ('Hal',     'Halloway',     6,   6),
       ('Vince',   'Val',          7,   2),
       ('Frank',   'Furt',         8,   NULL);