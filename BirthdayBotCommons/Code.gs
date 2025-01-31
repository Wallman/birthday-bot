function getSlackUserData (email,token) {
  // Docs https://api.slack.com/methods/users.lookupByEmail
    const lookupEmailUrl = "https://slack.com/api/users.lookupByEmail?email=" + email
    const options = {
        'method': 'get',
        'contentType': 'application/json',
        'headers': {'Authorization': 'Bearer ' + token}
    }
    // Docs https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app
    // Docs https://developers.google.com/apps-script/reference/url-fetch/http-response
    const response = UrlFetchApp.fetch(lookupEmailUrl, options)

    const slackUserData = JSON.parse(response.getContentText())
    Logger.log("Slack success response: " + slackUserData.ok)
    return {
        'name': slackUserData.user.profile.real_name,
        'image': slackUserData.user.profile.image_512,
        'userId': slackUserData.user.id,
        'email': email
    }
}

function getSlackUserDataByUserId (user,token) {
  // Docs https://api.slack.com/methods/users.info
    const lookupUser = "https://slack.com/api/users.info?user=" + user
    const options = {
        'method': 'get',
        'contentType': 'application/json',
        'headers': {'Authorization': 'Bearer ' + token}
    }
    const response = UrlFetchApp.fetch(lookupUser, options)

    const slackUserData = JSON.parse(response.getContentText())
    Logger.log("Slack success response: " + slackUserData.ok)
    return {
        'name': slackUserData.user.profile.real_name,
        'image': slackUserData.user.profile.image_512,
        'userId': user,
        'email': slackUserData.user.profile.email
    }
}

function getSlackChannelNameById(channelId,token) {
  // Docs https://api.slack.com/methods/users.info
    const lookupChannel = "https://slack.com/api/conversations.info?channel=" + channelId
    const options = {
        'method': 'get',
        'headers': {'Authorization': 'Bearer ' + token}
    }
    const response = UrlFetchApp.fetch(lookupChannel, options)

    const slackUserData = JSON.parse(response.getContentText())
    Logger.log(slackUserData)

    return slackUserData.channel.name
}

function postToSlack(channel,message,token) {
  // Docs https://api.slack.com/methods/chat.postMessage
  // https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app?hl=en#fetch(String,Object)
  const postMessage = "https://slack.com/api/chat.postMessage"
  const data = {text: message,channel,link_names:true}
    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(data),
        'headers': {'Authorization': 'Bearer ' + token}
    }
    const response = UrlFetchApp.fetch(postMessage, options)

    const slackUserData = JSON.parse(response.getContentText())
    Logger.log("Slack success response: " + slackUserData.ok)
    return slackUserData.ok
}