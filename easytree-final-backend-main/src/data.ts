import { TOURNAMENTSTATE } from "./Enum";
import { addScoreToBlock } from "./services/BlockService";
import { addScoreForUser, addUsersToKOPhase, nextDepth } from "./services/KOPhaseService";
import { createTournament, getCompleteTournamentResourceByID } from "./services/TournamentService";
import { createUser } from "./services/UserService";

export async function fillDatabank() {
    const tom = await createUser({ name: "Tom", email: "tomate@email.com", admin: false, password: "0nkelT0m!" })
    const mario = await createUser({ name: "Mario", email: "mario@email.com", admin: true, password: "itsmeM@R10" })
    const daisy = await createUser({ name: "Daisy", email: "gaensebluemchen@email.com", admin: true, password: "LiebeMeingarten123!" })
    const patricia = await createUser({ name: "Patricia", email: "nichtpatrick@email.com", admin: false, password: "kro$$ekra66epizza" })
    const eric = await createUser({ name: "Eric", email: "cartman@email.com", admin: true, password: "Am0rEric.thehe" })
    const luigi = await createUser({ name: "Luigi", email: "luigi@email.com", admin: false, password: "mybrotherM@R10" })
    const eugene = await createUser({ name: "Eugene", email: "geld@email.com", admin: true, password: "ichliebeGELD$$$4" })
    const spongebob = await createUser({ name: "Spongebob", email: "burgerbrater@email.com", admin: false, password: "Weichei.Schuppen.Junior3" })
    const anton = await createUser({ name: "Anton", email: "anton@email.com", admin: true, password: "Weichei.Schuppen.Junior2" })
    const kjelle = await createUser({ name: "Kjelle", email: "kjeld@web.de", admin: true, password: "Michi.2000" })

    //Abschlusspräsi User
    const sophia = await createUser({ name: "Sophia Müller", email: "sophia@email.com", admin: false, password: "itsmeM@R10" })
    const david = await createUser({ name: "David Wagner", email: "david@email.com", admin: false, password: "itsmeM@R10" })
    const lea = await createUser({ name: "Lea Richter", email: "lea@email.com", admin: false, password: "itsmeM@R10" })
    const jonas = await createUser({ name: "Jonas Becker", email: "jonas@email.com", admin: false, password: "itsmeM@R10" })
    const lara = await createUser({ name: "Lara Schmitz", email: "lara@email.com", admin: false, password: "itsmeM@R10" })
    const timo = await createUser({ name: "Timo Fischer", email: "timo@email.com", admin: false, password: "itsmeM@R10" })
    const emilia = await createUser({ name: "Emilia Klein", email: "emilia@email.com", admin: false, password: "itsmeM@R10" })
    const luca = await createUser({ name: "Luca Hartmann", email: "luca@email.com", admin: false, password: "itsmeM@R10" })

    //Abschlusspräsi Turniere
    //Turnier 1
    const turnier1 = await createTournament({
        name: "Schere-Stein-Papier",
        description: "Klassisches Schere-Stein-Papier. Gewinner = 2x Siege!",
        public: true,
        tags: ["Schere-Stein-Papier", "Lokal"],
        admins: [mario.id!],
        participants: [sophia.id!, david.id!, lea.id!, jonas.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.onGoing,
        startDate: new Date('2024-01-26T10:00:00.000Z')
    })

    //Abschlusspräsi Turniere
    //Turnier 2
    const turnier2 = await createTournament({
        name: "Schere-Stein-Papier",
        description: "Klassisches Schere-Stein-Papier. Gewinner = 2x Siege!",
        public: true,
        tags: ["Schere-Stein-Papier", "Lokal"],
        admins: [mario.id!],
        participants: [lara.id!, timo.id!, emilia.id!, luca.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.onGoing,
        startDate: new Date('2024-01-26T10:00:00.000Z')
    })

    //Abschlusspräsi Turniere
    //Turnier 3
    const turnier3 = await createTournament({
        name: "Schere-Stein-Papier",
        description: "Klassisches Schere-Stein-Papier. Gewinner = 2x Siege!",
        public: true,
        tags: ["Schere-Stein-Papier", "Lokal"],
        admins: [mario.id!],
        participants: [sophia.id!, lara.id!, lea.id!, luca.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.onGoing,
        startDate: new Date('2024-01-26T10:00:00.000Z')
    })

    //Abschlusspräsi Turniere
    //Turnier 4
    const turnier4 = await createTournament({
        name: "Schere-Stein-Papier",
        description: "Klassisches Schere-Stein-Papier. Gewinner = 2x Siege!",
        public: true,
        tags: ["Schere-Stein-Papier", "Lokal"],
        admins: [mario.id!],
        participants: [timo.id!, david.id!, emilia.id!, jonas.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.onGoing,
        startDate: new Date('2024-01-26T10:00:00.000Z')
    })

    /*
    //Playtest User der eingeloggt ist
    const playtester = await createUser({ name: "Playtester", email: "playtester@gmail.com", admin: false, password: "P1a?t3$T" })
    // Unsere drei EasyTree Dev User, die immer in den Turnieren drin sind damit es 3/4 ist
    const developer1 = await createUser({ name: "EasyTreeDev1", email: "easytreedev1@gmail.com", admin: false, password: "Ea$9Tr%1" })
    const developer2 = await createUser({ name: "EasyTreeDev2", email: "easytreedev2@gmail.com", admin: false, password: "Ea$9Tr%2" })
    const developer3 = await createUser({ name: "EasyTreeDev3", email: "easytreedev3@gmail.com", admin: false, password: "Ea$9Tr%3" })
    */

    //BIERPONG TURNIER
    const bierpong = await createTournament({
        name: "Bierpong",
        description: "es geht hier nicht ums gewinnen, sondern ums Saufen",
        public: true,
        tags: ["Spaß", "Bier"],
        admins: [daisy.id!],
        participants: [tom.id!, mario.id!, daisy.id!, patricia.id!, eric.id!, luigi.id!, eugene.id!, spongebob.id!],
        totalParticipants: 8,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.onGoing,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    await addUsersToKOPhase(bierpong.tournamentSystem![0], bierpong.participants!)

    await addScoreForUser(bierpong.tournamentSystem![0], tom.id!, 1)
    await addScoreForUser(bierpong.tournamentSystem![0], mario.id!, 2)
    await addScoreForUser(bierpong.tournamentSystem![0], daisy.id!, 3)
    await addScoreForUser(bierpong.tournamentSystem![0], patricia.id!, 4)
    await addScoreForUser(bierpong.tournamentSystem![0], eric.id!, 5)
    await addScoreForUser(bierpong.tournamentSystem![0], luigi.id!, 6)
    await addScoreForUser(bierpong.tournamentSystem![0], eugene.id!, 7)
    await addScoreForUser(bierpong.tournamentSystem![0], spongebob.id!, 8)

    await nextDepth(bierpong.tournamentSystem![0])

    //MARIOKART TURNIER
    const marioKart = await createTournament({
        name: "Mario Kart",
        description: "nur Regenbogenstrecken!!!",
        public: true,
        tags: ["Autorennen", "E-Sport", "Driften"],
        admins: [mario.id!],
        participants: [tom.id!, anton.id!, daisy.id!, patricia.id!, eric.id!, luigi.id!, eugene.id!],
        totalParticipants: 8,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-02-23T23:00:00.000Z')
    })

    //JENGA TURNIER
    const jenga = await createTournament({
        name: "Jenga",
        description: "wähle deinen nächsten Zug smart",
        public: true,
        tags: ["Jenga", "Geschicklichkeit"],
        admins: [daisy.id!],
        participants: [tom.id!, mario.id!, daisy.id!],
        totalParticipants: 8,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-03-25T23:00:00.000Z')
    })

    //WÜRFEL TURNIER
    const würfel = await createTournament({
        name: "Würfel",
        description: "WIRF!!",
        public: false,
        tags: ["Würfel", "Geschicklichkeit"],
        admins: [daisy.id!],
        participants: [tom.id!, mario.id!, daisy.id!, luigi.id!],
        totalParticipants: 9,
        participantsPerMatch: 3,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-03-02T23:00:00.000Z')
    })

    //SOLITÄR TURNIER
    const solitär = await createTournament({
        name: "Solitär",
        description: "...",
        public: true,
        tags: ["Solitär", "Kartenspiel"],
        admins: [daisy.id!],
        participants: [tom.id!, mario.id!, daisy.id!, luigi.id!],
        totalParticipants: 16,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-03-01T23:00:00.000Z')
    })

    //SCHACHTURNIER
    const schach = await createTournament({
        name: "Schach",
        description: "schlag den König",
        public: true,
        tags: ["Schach", "Strategie"],
        admins: [daisy.id!],
        participants: [tom.id!, mario.id!, daisy.id!, spongebob.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.drawPhase,
        startDate: new Date('2024-05-07T23:00:00.000Z')
    })

    //FORTNITE TURNIER
    const fortnite = await createTournament({
        name: "Fortnite",
        description: "last man standing",
        public: true,
        tags: ["Fortnite"],
        admins: [eric.id!],
        participants: [tom.id!, mario.id!, eugene.id!, eric.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.discarded,
        startDate: new Date('2024-02-12T23:00:00.000Z')
    })

    //GOLF TURNIER
    const golf = await createTournament({
        name: "Golf",
        description: "",
        public: true,
        tags: ["Gold", "Sport"],
        admins: [eric.id!],
        participants: [eric.id!, luigi.id!],
        totalParticipants: 2,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.discarded,
        startDate: new Date('2024-03-22T23:00:00.000Z')
    })

    /*
    //35 Turniere für Playtest - Playbook 2
    //Playtest Turnier 1
    const Playtest1 = await createTournament({
        name: "Playtest1",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 2
    const Playtest2 = await createTournament({
        name: "Playtest2",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 3
    const Playtest3 = await createTournament({
        name: "Playtest3",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 4
    const Playtest4 = await createTournament({
        name: "Playtest4",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 5
    const Playtest5 = await createTournament({
        name: "Playtest5",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 6
    const Playtest6 = await createTournament({
        name: "Playtest6",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 7
    const Playtest7 = await createTournament({
        name: "Playtest7",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 8
    const Playtest8 = await createTournament({
        name: "Playtest8",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 9
    const Playtest9 = await createTournament({
        name: "Playtest9",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 10
    const Playtest10 = await createTournament({
        name: "Playtest10",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 11
    const Playtest11 = await createTournament({
        name: "Playtest11",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 12
    const Playtest12 = await createTournament({
        name: "Playtest12",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 13
    const Playtest13 = await createTournament({
        name: "Playtest13",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 14
    const Playtest14 = await createTournament({
        name: "Playtest14",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 15
    const Playtest15 = await createTournament({
        name: "Playtest15",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 16
    const Playtest16 = await createTournament({
        name: "Playtest16",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 17
    const Playtest17 = await createTournament({
        name: "Playtest17",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 18
    const Playtest18 = await createTournament({
        name: "Playtest18",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 19
    const Playtest19 = await createTournament({
        name: "Playtest19",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 20
    const Playtest20 = await createTournament({
        name: "Playtest20",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 21
    const Playtest21 = await createTournament({
        name: "Playtest21",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 22
    const Playtest22 = await createTournament({
        name: "Playtest22",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 23
    const Playtest23 = await createTournament({
        name: "Playtest23",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 24
    const Playtest24 = await createTournament({
        name: "Playtest24",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 25
    const Playtest25 = await createTournament({
        name: "Playtest25",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 26
    const Playtest26 = await createTournament({
        name: "Playtest26",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 27
    const Playtest27 = await createTournament({
        name: "Playtest27",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 28
    const Playtest28 = await createTournament({
        name: "Playtest28",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 29
    const Playtest29 = await createTournament({
        name: "Playtest29",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 30
    const Playtest30 = await createTournament({
        name: "Playtest30",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 31
    const Playtest31 = await createTournament({
        name: "Playtest31",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 32
    const Playtest32 = await createTournament({
        name: "Playtest32",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 33
    const Playtest33 = await createTournament({
        name: "Playtest33",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 34
    const Playtest34 = await createTournament({
        name: "Playtest34",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })

    //Playtest Turnier 35
    const Playtest35 = await createTournament({
        name: "Playtest35",
        description: "Schere-Stein-Papier Turnier",
        public: true,
        tags: ["Schere-Stein-Papier"],
        admins: [developer1.id!],
        participants: [developer1.id!, developer2.id!, developer3.id!],
        totalParticipants: 4,
        participantsPerMatch: 2,
        tournamentState: TOURNAMENTSTATE.signUpPhase,
        startDate: new Date('2024-01-09T23:00:00.000Z')
    })
    */
}