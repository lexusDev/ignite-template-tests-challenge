import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
    
        await connection.runMigrations();
      });

    afterAll(async () => {
        await connection.query('DELETE FROM users');
        await connection.close();
      });

    it("Should be able to create a new user", async () => {
        const response = await request(app).post("/api/v1/users").send({
            name: "Admin",
            email: "admin@admin.com.br",
            password: "admin",
        });

        expect(response.status).toBe(201);
    });
});