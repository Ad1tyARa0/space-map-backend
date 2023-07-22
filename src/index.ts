import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import fs from "fs";

export interface Satellite {
  name: string;
  noradCatId: string | null;
  intlDes: string | null;
  launchDate: string | null;
  decayDate: string | null;
  objectType: string | null;
  orbitCode: string | null;
  countryCode: string | null;
  imageUrl: string | undefined;
}

export interface SatellitePaginated {
  total: number;
  totalPages: number;
  currentPage: number;
  satellites: Satellite[];
}

interface GetSatelliteInterface {
  limit: number;
  offset: number;
  nameOrId?: string;
}

function getRandomImageUrl() {
  const randomIndex = Math.floor(Math.random() * 17);
  return `./src/assets/images/${randomIndex}.jpg`;
}

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
    imageUrl: String
  }

  type SatellitePaginated {
    total: Int
    totalPages: Int
    currentPage: Int,
    satellites: [Satellite]
  }

  type Query {
    getSatellites(offset: Int, limit: Int, nameOrId: String): SatellitePaginated
  }
`;

const resolvers = {
  Query: {
    getSatellites: (
      _: unknown,
      { limit, offset, nameOrId }: GetSatelliteInterface
    ): SatellitePaginated | Error => {
      try {
        const data: Satellite[] = JSON.parse(
          fs.readFileSync("./src/data.json", "utf-8")
        );

        let filteredSatellites = data;

        if (nameOrId) {
          filteredSatellites = filteredSatellites.filter(e => {
            if (
              e.name?.toLowerCase().trim().includes(nameOrId) ||
              e.noradCatId === nameOrId
            ) {
              return e;
            }
          });
        }

        const total = filteredSatellites.length;
        const totalPages = Math.ceil(total / limit);

        const startIndex = offset * limit;
        const endIndex = offset * limit + limit;

        const satellites = filteredSatellites
          .slice(startIndex, endIndex)
          .map(satellite => ({
            ...satellite,
            imageUrl: getRandomImageUrl(),
          }));

        return {
          total,
          totalPages,
          currentPage: offset + 1,
          satellites,
        };
      } catch (error) {
        console.log(error);
        return error;
      }
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
