import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement Balance", () => {
    beforeAll(async () => {
        connection = await createConnection();
    
        await connection.runMigrations();

        await request(app).post("/api/v1/users").send({
            name: "Admin",
            email: "admin@admin.com.br",
            password: "admin",
        });

        const auth = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin",
        });

        const { token } = auth.body;

        await request(app).post("/api/v1/statements/deposit").set("Authorization", `Bearer ${token}`).send({
            amount: 500,
            description: "Test deposit 1",
        });

        await request(app).post("/api/v1/statements/deposit").set("Authorization", `Bearer ${token}`).send({
            amount: 400,
            description: "Test deposit 2",
        });
      });

    afterAll(async () => {
        await connection.query('DELETE FROM statements');
        await connection.query('DELETE FROM users');
        await connection.close();
      });

    it("Should be able to list a statements balances", async () => {
        const auth = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin",
        });

        const { token } = auth.body;

        const response = await request(app).get("/api/v1/statements/balance").set("Authorization", `Bearer ${token}`).send();

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("statement");
        expect(response.body).toHaveProperty("balance");
    });
});