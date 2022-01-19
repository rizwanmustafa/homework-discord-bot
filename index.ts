#!/usr/bin/env ts-node
// Require the necessary discord.js classes
import { Client, Intents } from 'discord.js';
import { resolve as pathResolve } from "path";
import { readFileSync, } from 'fs';

const envVars = JSON.parse(readFileSync(pathResolve(__dirname, "env.json")).toString())

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGE_TYPING
	],
	partials: [
		"CHANNEL",
	]
});

enum Subjects {
	Physics,
	Biology,
	Chemistry,
	Mathematics,
	ComputerScience,
}


let homeworks: { [subject: string]: Array<string> };

const loadHomeworks = () => {
	try {
		console.log("Reading from file '/home/rizwan/hw.json'")
		const hwContent = readFileSync("/home/rizwan/hw.json").toString();

		if (hwContent === null || hwContent === undefined || hwContent.trim() === "")
			throw "File is empty!";

		console.log("Parsing JSON from file '/home/rizwan/hw.json'")
		homeworks = JSON.parse(hwContent);
	}
	catch (e) {
		console.log("Could not perform the above operations successfully!")
		console.log(e + "\n");
	}
}

const getSubjectKey = (subject: Subjects): string => {
	if (subject === Subjects.Physics) return "P";
	else if (subject === Subjects.Biology) return "B";
	else if (subject === Subjects.Chemistry) return "C";
	else if (subject === Subjects.Mathematics) return "M";
	else if (subject === Subjects.ComputerScience) return "CS";
	else return "";
}

const getSubjectName = (subject: Subjects): string => {
	if (subject === Subjects.Physics) return "Physics";
	else if (subject === Subjects.Biology) return "Biology";
	else if (subject === Subjects.Chemistry) return "Chemistry";
	else if (subject === Subjects.Mathematics) return "Mathematics";
	else if (subject === Subjects.ComputerScience) return "Computer Science";
	else return "";
}

const getSubjectHW = (subject: Subjects): string => {
	const subjectKey = getSubjectKey(subject);
	let message = "";

	if (subjectKey === "") return "This subject is not supported as of yet!"

	if (homeworks === null || homeworks === undefined ||
		Object.keys(homeworks).length === 0)

		// TODO: Later send a dm to me reminding me to add the homeworks if any
		return "Looks like Rizwan forgot to update homeworks!"

	if (Object.keys(homeworks).indexOf(subjectKey) === -1) {
		let myID = envVars.myID;
		if (myID !== undefined)
			client.users.fetch(myID).then(user => user.send(`Reminder: Add homework for ${getSubjectName(subject)}`))
		return `Looks like Rizwan forgot to update homeworks for ${getSubjectName(subject)}`
	}

	const subjectHW = homeworks[subjectKey];
	message += getSubjectName(subject) + ":\n";

	if (subjectHW.length === 0) {
		message += `Horray! No homework!`
		return message
	}

	subjectHW?.forEach(hwLine => message += `	${hwLine} \n`);

	return message;
}

// Bot  events 
client.once('ready', () => {
	loadHomeworks();
	console.log(`The bot has logged in as ${client.user?.tag} `)

});

client.on("messageCreate", (msg) => {
	const msgContent = msg.content.toLowerCase();
	if (msg.author.bot === true)
		return;


	if (msgContent === "ping") {
		msg.channel.send("pong")
		return;
	}

	if (msgContent === "pong") {
		msg.channel.send("ping")
		return;
	}

	if (msgContent === "!hw" || msgContent === "!hw all") {
		msg.channel.send(getSubjectHW(Subjects.Physics));
		msg.channel.send(getSubjectHW(Subjects.Biology));
		msg.channel.send(getSubjectHW(Subjects.Chemistry));
		msg.channel.send(getSubjectHW(Subjects.Mathematics));
		msg.channel.send(getSubjectHW(Subjects.ComputerScience));
		return;
	}
	else if (msgContent.length >= 5 && msgContent.substring(0, 3) === "!hw") {
		const subjectKeys = msgContent.substring(4).split(" ");
		subjectKeys.forEach(subjectKey => {
			subjectKey = subjectKey.toLowerCase();

			if (subjectKey === "cs") msg.channel.send(getSubjectHW(Subjects.ComputerScience));
			if (subjectKey === "p") msg.channel.send(getSubjectHW(Subjects.Physics));
			if (subjectKey === "b") msg.channel.send(getSubjectHW(Subjects.Biology));
			if (subjectKey === "c") msg.channel.send(getSubjectHW(Subjects.Chemistry));
			if (subjectKey === "m") msg.channel.send(getSubjectHW(Subjects.Mathematics));
		})
	}
})

// Login to Discord with your client's token
client.login(envVars.TOKEN);
