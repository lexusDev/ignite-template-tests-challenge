import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create Statement Controller", () => {
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
        await connection.query('DELETE FROM statements');
        await connection.query('DELETE FROM users');
        await connection.close();
      });

    it("Should be able to create a new statement deposit", async () => {
        const auth = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin",
        });

        const { token } = auth.body;

        const response = await request(app).post("/api/v1/statements/deposit").set("Authorization", `Bearer ${token}`).send({
            amount: 500,
            description: "Test deposit",
        });

        expect(response.status).toBe(201);
        expect(response.body.amount).toBe(500);
        expect(response.body.type).toBe("deposit");
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("amount");
        expect(response.body).toHaveProperty("type");
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
    });

    it("Should be able to create a new statement withdraw", async () => {
        const auth = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin",
        });

        const { token } = auth.body;

        const response = await request(app).post("/api/v1/statements/deposit").set("Authorization", `Bearer ${token}`).send({
            amount: 200,
            description: "Test withdraw",
        });

        expect(response.status).toBe(201);
        expect(response.body.amount).toBe(200);
        expect(response.body.type).toBe("deposit");
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("user_id");
        expect(response.body).toHaveProperty("amount");
        expect(response.body).toHaveProperty("type");
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
    });
});