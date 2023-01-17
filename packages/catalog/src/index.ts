import { IModule } from "@jahadjs/core/src/types";
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

const productTypeDefs = `#graphql
    type Product {
       name: String
    }
`

const storeTypeDefs = `#graphql
    type CategoryPage {
        products: [Product]
    }

    type Query {
        categoryPage: CategoryPage
    }
`

const storeResolvers = {
    Query: {
        categoryPage: () => ({
            products: [
                {
                    name: 'mock data'
                }
            ]
        })
    }
}

const adminTypeDefs = `#graphql
    type Query {
        products: [Product]
    }
`

const adminResolvers = {
    Query: {
        products: () => [{ name: 'mock data' }]
    }
}

@Entity()
class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
}

export const CatalogModule: IModule = {
    identifier: 'catalog',
    dependsOn: ['graphql'],
    graphql: {
        store: {
            typeDefs: [productTypeDefs, storeTypeDefs],
            resolvers: [storeResolvers]
        },
        admin: {
            typeDefs: [productTypeDefs, adminTypeDefs],
            resolvers: [adminResolvers]
        }
    },
    db: {
        entities: {
            'Product': Product
        }
    }
}

export default CatalogModule

