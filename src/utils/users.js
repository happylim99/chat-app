const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //clean the date
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser) {
        return {
            error: "Username is in user"
        }
    }

    //Store user
    const user= { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

/*
addUser({
    id: 22,
    username: 'sean',
    room: 'conezion'
})
addUser({
    id: 32,
    username: 'sean2',
    room: 'conezion'
})
*/
//console.log(users)
/*
const removedUser = removeUser(22)

console.log(removedUser)
console.log(users)
*/