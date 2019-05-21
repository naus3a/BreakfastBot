'use strict';
const fs = require('fs');

let rawBotData = fs.readFileSync('botData.json');
var botData = JSON.parse(rawBotData);

const TeleBot = require('telebot');
const bot = new TeleBot(botData.bot);
const groupId = botData.group;

const days = [
                "monday",
                "tuesday",
                "wednesday",
                "thusrday",
                "friday"
             ];

var breakfastData = {
    'day': 'friday',
    'joiners': []
};

loadData();

bot.on('/when', (msg)=>{when(msg)});
bot.on('/join', (msg)=>{addJoiner(msg);});
bot.on('/joiners', (msg)=>{printJoiners(msg)});
bot.on(/^\/setday (.+)$/, (msg, props)=>{setDay(msg, props)});
bot.on('/help', (msg)=>{printHelp(msg)});
bot.on('/hidebuttons', (msg)=>{hideButtons(msg)});
bot.on('/test', (msg=>{test(msg)}));
bot.start();

var mainKbd = bot.keyboard([
                [bot.button('when is breakfast?', '/when'), bot.button('who\'s joining?', '/joiners')],
                [bot.button('join breakfast', '/join'), bot.button('hide buttons','/hidebuttons')]
                ], {resize: true});

function when(_msg){
    if(!isFromGroup(_msg))return;
    _msg.reply.text("This week we're having breakfast on "+breakfastData.day);
}

function addJoiner(_msg){
    if(!isFromGroup(_msg))return;
    var _id = _msg.from.id;
    if(!isIdJoining(_id)){
        var _name = _msg.from.username;
        if(_name==undefined){
            _name = _msg.from.first_name;
        }
        if(_name==undefined){
            _name = '🦄';
        }
        var _j = {'id':_id, 'username':_name};
        breakfastData.joiners.push(_j);
        saveData();
        _msg.reply.text("I logged you in, "+_msg.from.username); 
    }else{
        _msg.reply.text("You're already on the list, "+_msg.from.username);
    }
}

function isIdJoining(_id){
    for(var i=0;i<breakfastData.joiners.length;i++){
        if(breakfastData.joiners[i]['id']==_id){
            return true;
        }
    }
    return false;
}

function printJoiners(_msg){
    if(!isFromGroup(_msg))return;
    var _txt = "This week we have "+breakfastData.joiners.length+" people joining:\n";
    for(var i=0;i<breakfastData.joiners.length;i++){
        _txt += " "+breakfastData.joiners[i]['username']+"\n";
    }
    _msg.reply.text(_txt);
}

function test(_msg){
    //console.log(_msg)
    //_msg.reply.text(_msg.chat.id);
}

function isFromGroup(_msg){
    var _b = (_msg.chat.id==groupId);
    if(_b==false){
        _msg.reply.text("Sorry, "+_msg.from.username+" I don't speak to strangers.");
    }
    return _b;
}

function setDay(_msg, _props){
    if(!isFromGroup(_msg))return;
    var _day = _props.match[1];
    if(_day==undefined || _day=="")return
    if(isGoodDay(_day)){
        breakfastData.day = _day;
        _msg.reply.text("Ok, I set the breakfast day to "+_theDay);
        saveData();
    }else{
        var _txt = "Sorry, I cannot set the breakfast day to "+_day+". Good days would be:\n";
        for(var i=0;i<days.length;i++){
            _txt += days[i]+'\n';
        }
        _msg.reply.text(_txt);
    }
}

function isGoodDay(_day){
    for(var i=0;i<days.length;i++){
        if(_day==days[i])return true;
    }
    return false;
}

function printHelp(_msg){
    var _txt = "These are the commands I will accept:\n";
    _txt += "/when returns the day of the next breakfast\n";
    _txt += "/join will sign you in for next breakfast\n";
    _txt += "/joiners will print a list of all the people joining next breakfast\n";
    _txt += "/setday [day] allows you to set the day for next breakfast\n";

    return bot.sendMessage(_msg.from.id, _txt, {mainKbd});
}

function hideButtons(_msg){
    bot.sendMessage(msg.from.id, "Hiding my buttons. Type /help if you want them back.");
}

function loadData(){
    let rawData = fs.readFileSync('data.json');
    breakfastData = JSON.parse(rawData);
}

function saveData(){
    let rawData = JSON.stringify(breakfastData);
    fs.writeFileSync('data.json', rawData);
}
