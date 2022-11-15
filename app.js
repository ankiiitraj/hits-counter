const fs = require("fs")
const { createCanvas } = require("canvas");
const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const path = require("path")
const Redis = require('ioredis');

if(process.env.NODE_ENV === "dev") {
    require('dotenv').config();
}


function createHitsImg(hits) {
    const WIDTH = 400;
    const HEIGHT = 50;
    
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");
    
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#f2f2f2";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Ran ${hits} times`, WIDTH/2, 35);
    
    const buffer = canvas.toBuffer("image/png");
    return fs.writeFileSync("test.png", buffer);
}


const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD
});

app.get('/', async (req, res) => {
    res.json({hello: "world"})
})

app.get('/hit', async (req, res) => {
    const hitsCount = parseInt(req.query.by) || 1;
    
    await redis.incrby("hits", hitsCount)
    
    console.log(`hit added, incremented by ${hitsCount}`);
    res.sendStatus(200)
})

app.get('/hits', async (req, res) => {
    const hits = await redis.get("hits")
    console.log(`hits: ${hits}`);
    res.status(200).json({hits});
})

app.get('/hitsImg', async (req, res) => {
    const hits = await redis.get("hits")
    console.log(`hits: ${hits}`);
    createHitsImg(hits)
    res.status(200).sendFile(path.join(__dirname, "./test.png"));
})

app.listen(port, () => {
  console.log(`app listening on port ${port} and env ${process.env.NODE_ENV}`)
})