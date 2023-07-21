import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import fs from "fs";
// const getImageFilePath = (noradCatId: string) => {
//   return `/satellite_images/${noradCatId}.jpg`;
// };
function getRandomImageUrl() {
    const imageFiles = fs.readdirSync("./src/images");
    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    const randomImageFileName = imageFiles[randomIndex];
    return `/satellite_images/${randomImageFileName}`;
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
// : {
//   total: number;
//   totalPages: number;
//   currentPage: number;
//   satellites: Satellite[];
// }
const resolvers = {
    Query: {
        getSatellites: (_, { limit, offset, nameOrId }) => {
            const data = JSON.parse(fs.readFileSync("./src/data.json", "utf-8"));
            let filteredSatellites = data;
            // if (noradCatId) {
            //   filteredSatellites = filteredSatellites.filter(
            //     e => e.noradCatId === noradCatId
            //   );
            // }
            // if (name) {
            //   filteredSatellites = filteredSatellites.filter(e => {
            //     if (e.name !== null) {
            //       e.name.toLowerCase().trim().includes(name.toLowerCase().trim());
            //     }
            //   });
            // }
            if (nameOrId) {
                filteredSatellites = filteredSatellites.filter(e => {
                    if (e.name?.toLowerCase().trim().includes(nameOrId) ||
                        e.noradCatId?.toLowerCase().trim().includes(nameOrId)) {
                        return e;
                    }
                });
            }
            const total = data.length;
            const totalPages = Math.ceil(total / limit);
            const startIndex = offset;
            const endIndex = offset + limit;
            const satellites = filteredSatellites
                .slice(startIndex, endIndex)
                .map(satellite => ({
                ...satellite,
                imageUrl: getRandomImageUrl(),
            }));
            return {
                total,
                totalPages,
                currentPage: Math.floor(offset / limit) + 1,
                satellites,
            };
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
