const express = require("express");
const { Pool } = require("pg");
const multer = require("multer");
const isAuth = require("../middlewares/auth");

const router = express.Router();

const { pgsql } = require("../db");
const upload = multer({ dest: "./public/images" });

const pool = new Pool(pgsql);

// router.all("/*", (req, res, next) => {
//   if (req.session.isAdminLoggedIn) {
//     next();
//   } else {
//     res.redirect("/admin/login");
//   }
// });

router.get("/register", [isAuth], function (req, res) {
  res.render("party/register", {
    message: "",
    error: "",
  });
});

router.post("/submit", [isAuth, upload.single("logo")], async function (
  req,
  res
) {
  const logo = req.file.filename;
  const query = `insert into party(name,short_name,main_candidate,logo) values('${req.body.name}','${req.body.short_name}','${req.body.main_candidate}','${logo}') `;
  try {
    await pool.query(query);
    res.render("party/register", {
      message: "registered successfully",
      error: "",
    });
  } catch (error) {
    console.log(error);
    res.render("party/register", {
      message: "",
      error: "something went wrong",
    });
  }
});

router.get("/get-all", isAuth, async function (req, res) {
  try {
    const query = "select * from party";
    const result = await pool.query(query);
    res.render("party/show-list", {
      parties: result.rows,
    });
  } catch (error) {
    console.log(error);
    res.send("<h1>something went wrong</h1>");
  }
});

router.get("/edit/:id", isAuth, async function (req, res) {
  const id = req.params.id;
  const query = `select * from party where id = ${id}`;
  try {
    const result = await pool.query(query);
    res.render("party/edit", {
      party: result.rows[0],
      message: "",
      error: "",
    });
  } catch (error) {
    res.send("<h1 style='color:red' >something went wrong</h1>");
    console.log(error);
  }
});

router.post("/register-submit", isAuth, async function (req, res) {
  const query = `update party set name='${req.body.name}' , main_candidate='${req.body.main_candidate}' , short_name='${req.body.short_name}' where id = ${req.body.id} `;
  try {
    await pool.query(query);
    res.redirect("/party/get-all");
  } catch (error) {
    res.send("<h1 style='color:red' >something went wrong</h1>");
    console.log(error);
  }
});

router.post("/logo-edit", [isAuth, upload.single("logo")], async function (
  req,
  res
) {
  const logo = req.file.filename;
  const query = `update party set logo = '${logo}' where id = ${req.body.id} `;
  try {
    await pool.query(query);
    res.redirect("/party/get-all");
  } catch (error) {
    console.log(error);
    res.send("<h1 style='color:red' >something went wrong</h1>");
  }
});

router.get("/delete/:id", isAuth, async function (req, res) {
  const id = req.params.id;
  const query = `delete from party where id = ${id}`;
  try {
    await pool.query(query);
    res.redirect("/party/get-all");
  } catch (error) {
    res.send("<h1 style='color:red' >something went wrong</h1>");
    console.log(error);
  }
});

module.exports = router;

// CURD create update read and delete
