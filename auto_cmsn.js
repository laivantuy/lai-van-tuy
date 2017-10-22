//Auto cảm xúc
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('./config/database.js');
var fs = require('fs');
const login = require("facebook-chat-api");
var async = require('async');
var database = require("./node_modules/hoangtien_getinfo.js");

console.log('AUTO_CMSN on Start');

setInterval(function(){
	mongoClient.connect(configDB.url, function(err, row1) {
		var accounts = row1.collection('auto_chucmungsinhnhat');
		var time = get_time()
		console.log(time)
		accounts.find({'db.trangthai': 1, 'db.time':{$lte:time} }).toArray(function (err, data_accounts) {
			if(err)	return console.log(err)

			if(data_accounts.length > 0)
			{
				async.forEachLimit(data_accounts, 1, (value_account, next_one) => {
					console.log("-------"+value_account.db.id_account+"------");
					database.find_accounts_facebook_messenger(value_account.db.id_account, (err, data_account_token)=>{
						login({appState: JSON.parse(data_account_token[0].db.cookie)}, (err, api) => {
					        if(err)
					        {
					        	var cmsn = row1.collection('auto_chucmungsinhnhat');
								cmsn.updateOne({'db.id':value_account.db.id}, {$set: { 'db.trangthai': 'err'}}, function (err,row) {
									if (err) return console.log(err)

									var account = row1.collection('accounts_facebook_messenger')
									account.updateOne({'db.id':value_account.db.id_account}, {$set: { 'db.cookie': 'err'}})
									next_one()
								})
					        	return console.error(err);
					        }

					        api.getFriendsList((err, data) => {
					            if(err) return console.error(err);
					            	async.forEachLimit(data, 1, (value_fre, next) => {
					            		if(value_fre.isBirthday == true)
						            	{
						            		var ds_cautraloi = xulycautraloi(value_account.db.noidung)
											api.sendMessage(get_name_cautraloi(random_cautraloi(ds_cautraloi),value_fre.fullName), value_fre.userID);
											next()
											return
						            	}
						            	else
						            	{
						            		next()
						            		return
						            	}
					            	},()=>{
					            		var cmsn = row1.collection('auto_chucmungsinhnhat');
										cmsn.update({'db.id':value_account.db.id}, {$set: { 'db.trangthai': 'done'}}, function (err,row) {
											if (err) return console.log(err)
											next_one()
										})
					            	})
					        });
					    });
					})
					console.log("--------------");
				},()=>console.log('end'))
			}
			else
				return console.log('AUTO_CMSN Chua co ai dung')
		})
	});
},60000*2)

function xulycautraloi (text)
{
	var str = text
	str= str.split(",");
	return str;
}

function random_cautraloi (text)
{
	return text[Math.floor((Math.random() * text.length) + 0)]
}

function get_name_cautraloi (text, value)
{
	var str = text
	str= str.replace(/{get_name}/g,value);
	return str;
}

function random_reactions(text)
{
	return text[Math.floor((Math.random() * text.length) + 0)]
}

function get_time()
{
	var d = new Date();
	var h = d.getHours();
	var p = d.getMinutes();

	return h*3600+p*60
}