const config = require("./config.json")

const { ShardingManager } = require("discord.js")
const shard = new ShardingManager("./index.js", {
    token: config.TOKEN,
    autoSpawn: true
})

shard.on("shardCreate", shard => console.log(`----- [Hikari Shard] - ${shard.id} -----`))

shard.spawn()
