const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
/*
let count = 0
io.on('connection', (socket) => {
    console.log('New connection with count example')
    socket.emit('countUpdated', count)
    socket.on('increment', () => {
        count++
        //by using socket, only one side of client see the changes
        //socket.emit('countUpdated', count)

        //emit to every connection available
        io.emit('countUpdated', count)
    })
})
*/
/*
io.on('connection', (socket) => {
    socket.emit('message', {
        text: 'Welcome',
        createdAt: new Date().getTime()
    })
})
*/


io.on('connection', (socket) => {

    socket.on('join', (options, callback) => {
        //options = {username, room}
        const { error, user } = addUser({ id: socket.id, ...options })

        if(error) {
            return callback(error)
        }
        //join can only be used in server site
        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has join ${user.room}`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        //callback && callback()
        callback()
    })
    //original
    /*
    socket.on('sendMessage', (msg) => {
        io.emit('message', msg)
    })
    */
    
    //with server acknowledgement
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        console.log(user.username)
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locmessage', generateLocMessage(user.username, location.latitude, location.longitude))
        callback()
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})