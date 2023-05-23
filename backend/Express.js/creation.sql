PRAGMA foreign_keys = ON;

CREATE TABLE "stock stats"(
"Primary key" integer PRIMARY KEY,
"Current Company valuation" real NOT NULL,
"Number of authorized Company shares" integer NOT NULL,
"Number of issued Company shares" integer NOT NULL,
"Number of outstanding Company shares" integer NOT NULL,
"Number of Company shares available for purchase" integer NOT NULL,
"Price per share" real NOT NULL,
"Cash value of the shares available for purchase" real NOT NULL,
"Stats entry datetime" text NOT NULL);

CREATE TABLE "stock reservation"(
"Primary key" integer PRIMARY KEY,
"Stock stats table entry primary key" integer,
"Number of reserved stocks" integer NOT NULL,
"Stock reservation start datetime" text NOT NULL,
"Reserving-user access token" text NOT NULL,
FOREIGN KEY("Stock stats table entry primary key") REFERENCES "stock stats"("Primary key"));

CREATE TABLE "users"(
"Primary key" integer PRIMARY KEY,
"First name" text NOT NULL,
"Last name" text NOT NULL,
"Email address" text NOT NULL,
"Email address verified" text,
"Phone number" text NOT NULL,
"Salt-hashed password" text NOT NULL,
"Password salt" text NOT NULL,
"Admin" text NOT NULL,
"Access token" text NOT NULL,
"User deleted" text);

CREATE TABLE "transactions"(
"Primary key" integer PRIMARY KEY,
"User primary key" integer,
"Stock stats table entry primary key" integer,
"Transaction start datetime" text NOT NULL,
"Transaction end datetime" text NOT NULL,
"PayPal transaction (order) ID" text NOT NULL,
"Company stock transaction ID" text NOT NULL,
"Number of shares" integer NOT NULL,
"Payment processing initiated" text NOT NULL,
"Payment processing completed" text,
"Payment processing failure" text,
FOREIGN KEY("User primary key") REFERENCES "users"("Primary key"),
FOREIGN KEY("Stock stats table entry primary key") REFERENCES "stock stats"("Primary key"));

INSERT INTO "users" ("First name", "Last name", "Email address", "Email address verified", "Phone number", "Salt-hashed password", "Password salt", "Admin", "Access token") VALUES("Allen", "Young", "admin@allenyoung.dev", "true", "123-456-7890", "aaaaaabbbbbbcccccc", "111122223333", "true", "12345abcd");
