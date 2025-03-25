//import { PrismaClient } from "@prisma/client";
//const prismaClientSingleton = ()=>{
//    return new PrismaClient()
//}
//declare global
//{
//    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
//}
//const db = globalThis.prisma ?? prismaClientSingleton()

//export default db
//if (process.env.NODE_ENV!=='production')globalThis.prisma=db

import { PrismaClient } from '@prisma/client'
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient()
    }

    prisma = global.prisma
  }
}
//@ts-ignore
export default prisma