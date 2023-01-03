import { Connection } from "typeorm";
import request from "supertest";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Show User Profile Controller", () => {
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

    it("Should be able to return info of user", async () => {
        const auth = await request(app).post("/api/v1/sessions").send({
            email: "admin@admin.com.br",
            password: "admin",
        });

        const { token } = auth.body;

        const response = await request(app).get("/api/v1/profile").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("id");
        expect(response.body).toHaveProperty("name");
        expect(response.body).toHaveProperty("email");
        expect(response.body).toHaveProperty("created_at");
        expect(response.body).toHaveProperty("updated_at");
    });
});