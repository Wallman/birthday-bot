const token = 'X'

let config

const setConfig = (envName) => {
    if (envName === 'live') {
        config = {
            slackWebHookUrl: 'https://hooks.slack.com/services/X/Y/z', //#fun-and-fanfare
            googleSheetId: 'X'
        }
    } else {
        config = {
            slackWebHookUrl: 'https://hooks.slack.com/services/X/Y/>', //#test-birthday
            googleSheetId: 'X'
        }
    }
}

const getNonEmptyValuesFromSheet = (tabAndRange) => {
    const range = SpreadsheetApp.openById(config.googleSheetId).getRangeByName(tabAndRange)
  //Todo: check if any value is empty
    return values = range.getValues().filter((item) => item[0] && item[0].toString().length > 0)
}

const getRandomNumber = (min, max) =>
    Math.round(Math.random() * (max - min)) + min

// Docs https://stackoverflow.com/questions/32419756/how-do-you-tag-people-with-a-slack-bot
const insertNameAndUserId = ({wish, slackUser: {name, userId}}) =>
    (wish.toString().replace(/{slack_handle}/g, '<@' + userId + '>').replace(/{name}/g, name))

const getPersonFromRow = (row) => {
    const person = {
        birthDay: row[1],
        birthMonth: row[2],
        email: row[0].trim()
    }
    return person
}

const getCustomWish = (email) => {
    customWishes = getNonEmptyValuesFromSheet("custom_messages!A:B")
    wishes = customWishes.filter((row) => row[0].trim() === email).map((it) => it[1])
    return wishes[0]
}

const getBirthdayPeople = (day, month) => {
    const people = getNonEmptyValuesFromSheet("birtdays!A2:F")

    const optedOut = getNonEmptyValuesFromSheet("opted_out!A:A").map((it) => it[0].trim())
    const birthdayPeople = people.map(getPersonFromRow).filter((person) => person.birthDay == day && person.birthMonth == month && !optedOut.includes(person.email))

    Logger.log(`Today is ${day}-${month} and we have ${birthdayPeople.length} birthday people out of ${people.length}`)

    const wishes = getNonEmptyValuesFromSheet("wishes!A:A").map((it) => it[0].trim())

    birthdayPeople.forEach(person => {
        try{
          const index = getRandomNumber(0, wishes.length - 1)
          Logger.log("email: " + person.email)
          const customWish = getCustomWish(person.email)
          Logger.log("customWish " + customWish + "email: " + person.email)
          person.wish = customWish || wishes[index]
          wishes.splice(index, 1)
                  person.slackUser = botCommons.getSlackUserData(person.email, token)

          person.message = insertNameAndUserId(person)
          Logger.log("message " + person.message)
        }catch (e){
          Logger.log("Could not find person person.email" + e)
        }
    })

    return birthdayPeople
}

const getEmojis = () => {
    const values = getNonEmptyValuesFromSheet("emoji_to_randomize!A:A")
    const emoji = []
    for (let i = 0; i < 11; i++) {
        const index = getRandomNumber(0, values.length - 1)
        emoji.push(values[index])
        values.splice(index, 1)
    }
    return emoji.join('')
}

const postToSlack = (person) => {
    // See https://app.slack.com/block-kit-builder/T73KQ7014
    Logger.log("slackpost " + person)
    Logger.log(`Wishing happy birthday to ${person.slackUser.userId} ${person.slackUser.name}`)
    const payload = {
        "blocks": [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "" + person.message + "\n" + getEmojis()
                },
                "accessory": {
                    "type": "image",
                    "image_url": person.slackUser.image,
                    "alt_text": person.slackUser.name
                }
            }
        ]
    }
    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload),
        'link_names': 1
    }
    const response = UrlFetchApp.fetch(config.slackWebHookUrl, options)
    Logger.log(response)
}

function test_code() {
  actionPostBirthday('test')
}

function actionPostBirthday(envName = 'live') {
  setConfig(envName)
    const date = new Date()
    const persons = getBirthdayPeople(date.getDate(), date.getMonth() + 1)
    var notFound = []
    for (const p of persons){
      if(p.slackUser){
        postToSlack(p)
      } else {
        notFound.push(p.email)
      }
    }
    if(notFound.length > 0){
     throw "People not found: " + notFound.join(", ")
    }
}