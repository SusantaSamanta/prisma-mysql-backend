# prisma-mysql-backend
RESTful backend built with Express.js, Prisma ORM, and MySQL featuring CRUD operations and database management.


# Steps for setup prisma with mysql 

    npm init
    npm express
    create index.js
    create one server 
    create some routes 
    
    install : prisma : npm i prisma
    install : prisma/client : npm i @prisma/client

    install prisma 6 :  npm install prisma@6.16.2 @prisma/client@6.16.2

    then> npx prisma init 
    this will  : 
    Initialized Prisma in your project
    prisma/
      schema.prisma
    prisma.config.ts
    .env
    .gitignore


## Setup mysql DB connection :
    go to .env
    DATABASE_URL="mysql://root:password@localhost:3306/dbName"

## Edit prisma/schema.prisma:
    generator client {
      provider = "prisma-client"
    }

    datasource db {
      provider = "mysql"
      url= env("DATABASE_URL")        ///some time in this line vsCode show error 
    }

## Models are create inside this schema.prisma file 

### To giving  the table name always give prurel name. This is very help full.
    generator client {}
      .......
      ......{
      url= env("DATABASE_URL")        
    }

    model users{ //add s at end 
      id     Int      @id @default(autoincrement())
      name   String
      email  String   @unique
    }

    model subject{
      ....
      ...
    }
### We have to create all model in this file

## For checking is all ok :
    npx prisma validate

## For create migration model for sql :
    npx prisma migrate dev --name (give_name_here)

    * This command help to sync changes to the actual mySql DB with prisma

    For every change in model schema we have to run this command. Add a meaningful name depending on change like: --name phone_add
### Also remind that 
    For every time we run this command if no error.
    Inside Migration folder new file create like : 20260627100131_phone_add/migration.sql



