import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../database";
import { User } from "@modules/users/entities/User";

let connection: Connection;

describe("Authenticate an user", () => {
    beforeAll(async () => {
        connection = await createConnection();
    
        await connection.runMigrations();

        await request(app).post("/api/v1/users").send({
            name: "Admin",
            email: "admin@admin.com.br",
            password: "admin",
        });
      });

      afterAll(async () => {
        await connection.query('DELETE FROM users');
        await connection.close();
      });

    it("Should be able to return token and user", async () => {
        const response = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin",
        });

        expect(response.body).toHaveProperty("user");
        expect(response.body).toHaveProperty("token");
    });
});