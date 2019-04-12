const socket = io()

// Elements
const $messageform = document.querySelector('#message-form')
const $messageFormInput = $messageform.querySelector('input')
const $messageFormButton = $messageform.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    

    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    console.log(newMessageMargin)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdBy: message.createdBy,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdBy: message.createdBy,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    console.log('e.target.elements.message.value: ' + message)

    $messageFormButton.setAttribute('disabled', 'disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        if (error) {
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})
 


$sendLocationButton.addEventListener('click', () =>{
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position)
        socket.emit('sendLocation', { latitude: position.coords.latitude, longitude: position.coords.longitude }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})