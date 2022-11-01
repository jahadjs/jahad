import { DataSource } from "typeorm"

export class DbConnection {
    private dataSource?: DataSource

    setConnection(dataSource: DataSource) {
        this.dataSource = dataSource
    }

    getConnection() {
        return this.dataSource as DataSource
    }
}
