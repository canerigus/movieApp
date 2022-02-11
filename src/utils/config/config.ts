import { createConnection } from "typeorm"
//typeorm database connection fn. initiated in app.ts
export const connectDatabase = async () => {
  try {
    await createConnection({
      type: "mysql",
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: true,
      logging: false,
      entities: [
        "dist/entity/**/*.js"
      ]
    });
    console.log('Database connected')
  } catch (err) {
    console.log(err)
    console.log('Something went wrong while connecting to Database!')
  }
}

//session options
export const sessionOptions = {
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET_KEY || 'notagoodsecret',
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 * 2),
    maxAge: 1000 * 60 * 60 * 24 * 7 * 2
  }
}

