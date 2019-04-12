const generateMessage = (text, createdBy) => {
    return {
        text,
        createdBy,
        createdAt: new Date().getTime()
    }
}
const generateLocationMessage = (url, createdBy) => {
    return {
        url,
        createdBy,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}