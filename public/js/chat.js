const socket = io()
/*
socket.on('countUpdated', (count) => {
    console.log('count updated', count)
})
document.querySelector('#increment').addEventListener('click', () => {
    console.log('clicked')
    socket.emit('increment')
})
*/

/*
socket.on('welcomeMessage', (msg) => {
    console.log(msg)
})
*/

//elements
//dollor sign is a convention of declaring a element that is selected from DOM
const $messageForm = document.querySelector('#msgForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locMessageTemplate = document.querySelector('#locMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messagescontainer
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        // the function below will always scroll to the bottom
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locmessage',(message) => {
    const html = Mustache.render(locMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

const msgBox = document.getElementById('msg')
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.msg.value
    //original
    //socket.emit('sendMessage', message)

    //with acknowledgement
    socket.emit('sendMessage', message, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error) {
            return console.log(error)
        }
        console.log('success')
    })
    //msgBox.value = ''
})

const $locBtn = document.querySelector('#send-location')
$locBtn.addEventListener('click', () => {
    $locBtn.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by our browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            $locBtn.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})