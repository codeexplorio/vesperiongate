Data sources
A data source determines how Prisma ORM connects to your database, and is represented by the datasource block in the Prisma schema. The following data source uses the postgresql provider and includes a connection URL:

NOTE
As of Prisma ORM v7, the url, directUrl, and shadowDatabaseUrl fields in the Prisma schema datasource block are deprecated. Configure these fields in Prisma Config instead.

datasource db {
  provider = "postgresql"
  url      = "postgresql://johndoe:mypassword@localhost:5432/mydb?schema=public"
}

A Prisma schema can only have one data source. However, you can:

Programmatically override a data source url when creating your PrismaClient
Specify a different URL for Prisma Migrate's shadow database if you are working with cloud-hosted development databases
Note: Multiple provider support was removed in 2.22.0. Please see Deprecation of provider array notation for more information.
Securing database connections

Some data source providers allow you to configure your connection with SSL/TLS, and provide parameters for the url to specify the location of certificates.

Configuring an SSL connection with PostgreSQL
Configuring an SSL connection with MySQL
Configure a TLS connection with Microsoft SQL Server
Prisma ORM resolves SSL certificates relative to the ./prisma directory. If your certificate files are located outside that directory, e.g. your project root directory, use relative paths for certificates:

NOTE
When you're using a multi-file Prisma schema, Prisma ORM resolves SSL certificates relative to the ./prisma/schema directory.

datasource db {
  provider = "postgresql"
  url      = "postgresql://johndoe:mypassword@localhost:5432/mydb?schema=public&sslmode=require&sslcert=../server-ca.pem&sslidentity=../client-identity.p12&sslpassword=<REDACTED>"
}

Previous
Overview
