const server = require('./server.js');
const supertest = require('supertest');
const req = supertest(server.app);

let agent = supertest.agent();


describe("Server", () => {
  describe("User info", () => {
    it("GET /loginInfo should have whether the user's logged in, email, user id, and username (or placeholder values)", async () => {
      const res = await req.get("/loginInfo");
      if (res.status == 302) {
        const res2 = await req.get(res.header["location"]);
        expect(res2.body).toHaveProperty('login');
        expect(res2.body).toHaveProperty('email');
        expect(res2.body).toHaveProperty('userid');
        expect(res2.body).toHaveProperty('username');
      }
      else {
        expect(res.body).toHaveProperty('login');
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('userid');
        expect(res.body).toHaveProperty('username');
      }
    })
  })

  describe("Log in", () => {
    it("Users should be able to log in", async () => {
      const res = req
        .post("/login")
        .query({"email": "test@test", "password": "test"})
        .expect(302)
        .end(function (err, res) {
          if (err) throw err;
          agent.saveCookies(res);
        });
        
      const res2 = req.get(res.header["location"]).
        expect(200, function(err, res) {
          expect(res.body['login']).toBe(true);
          expect(res.body['email']).toBe("test@test");
        }).end((err, res) => {if (err) throw err});
    })
  })

  afterAll(() => {
    server.server.close();
  })
})
