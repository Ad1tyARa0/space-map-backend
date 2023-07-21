import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
const typeDefs = `
  type Satellite {
    name: String
    noradCatId: String!
    intlDes: String
    launchDate: String
    decayDate: String
    objectType: String
    orbitCode: String
    countryCode: String
  }

  type Query {
    getSatellites: [Satellite]
  }
`;
const data = [
    {
        name: "MIDAS 3 DEB",
        noradCatId: "196",
        intlDes: "1961-018D",
        launchDate: "1961-07-12",
        decayDate: null,
        objectType: "DEBRIS",
        orbitCode: null,
        countryCode: "US",
    },
];
const resolvers = {
    Query: {
        getSatellites: () => {
            return data;
        },
    },
};
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
const { url } = await startStandaloneServer(server, {
    listen: { port: 8989 },
});
console.log(`Server ready at ${url}`);
