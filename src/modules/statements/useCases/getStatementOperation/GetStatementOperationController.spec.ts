import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get Statement By Id", () => {
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

        const statementsReposnse = await request(app).get("/api/v1/statements/balance").set("Authorization", `Bearer ${token}`).send();

        const { statement } = statementsReposnse.body;

        const url = "/api/v1/statements/" + statement[0].id; 
        const responseOne = await request(app).get(url).set("Authorization", `Bearer ${token}`).send();
        
        expect(responseOne.status).toBe(200);
        expect(responseOne.body.type).toBe("deposit");
        expect(responseOne.body).toHaveProperty("id");
        expect(responseOne.body).toHaveProperty("user_id");
        expect(responseOne.body).toHaveProperty("description");
        expect(responseOne.body).toHaveProperty("amount");
        expect(responseOne.body).toHaveProperty("type");
        expect(responseOne.body).toHaveProperty("created_at");
        expect(responseOne.body).toHaveProperty("updated_at");

        const urlTwo = "/api/v1/statements/" + statement[1].id; 
        const responseTwo = await request(app).get(urlTwo).set("Authorization", `Bearer ${token}`).send();
        
        expect(responseTwo.status).toBe(200);
        expect(responseTwo.body.type).toBe("deposit");
        expect(responseTwo.body).toHaveProperty("id");
        expect(responseTwo.body).toHaveProperty("user_id");
        expect(responseTwo.body).toHaveProperty("description");
        expect(responseTwo.body).toHaveProperty("amount");
        expect(responseTwo.body).toHaveProperty("type");
        expect(responseTwo.body).toHaveProperty("created_at");
        expect(responseTwo.body).toHaveProperty("updated_at");
    });
});