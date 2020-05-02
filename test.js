function convertTime(sec) {
  var hours = Math.floor(sec / 3600);
  hours >= 1 ? (sec = sec - hours * 3600) : (hours = "00");
  var min = Math.floor(sec / 60);
  min >= 1 ? (sec = sec - min * 60) : (min = "00");
  sec < 1 ? (sec = "00") : void 0;

  hours.toString().length == 1 ? (hours = "0" + hours) : void 0;
  min.toString().length == 1 ? (min = "0" + min) : void 0;
  sec.toString().length == 1 ? (sec = "0" + sec) : void 0;

  return hours + ":" + min + ":" + sec;
}

console.log(convertTime(~~(1139303232 / 1000)));
const oldPresenceString = [
  '{"name":"Spotify","type":"LISTENING","url":null,"details":"Stacy","state":"Quinn XCII","applicationID":null,"timestamps":{"start":"2020-05-01T14:39:08.982Z","end":"2020-05-01T14:41:57.875Z"},"party":{"id":"spotify:167148129861369856"},"assets":{"largeText":"Coffee","smallText":null,"largeImage":"spotify:ab67616d0000b273fedbab9e1f2f2a1b66a87c55","smallImage":null},"syncID":"6cQWrYaoIaaTTDKVTH8GDP","flags":48,"emoji":null,"createdTimestamp":1588343949390}',
];
const newPresenceString = [
  '{"name":"Spotify","type":"LISTENING","url":null,"details":"Stacy","state":"Quinn XCII","applicationID":null,"timestamps":{"start":"2020-05-01T14:38:19.960Z","end":"2020-05-01T14:41:08.853Z"},"party":{"id":"spotify:167148129861369856"},"assets":{"largeText":"Coffee","smallText":null,"largeImage":"spotify:ab67616d0000b273fedbab9e1f2f2a1b66a87c55","smallImage":null},"syncID":"6cQWrYaoIaaTTDKVTH8GDP","flags":48,"emoji":null,"createdTimestamp":1588343956000}',
];

// result = newPresenceString.filter((x) => !oldPresenceString.includes(x));

const oldPresenceString2 = [].toString();
const newPresenceString2 = [].toString();
// result = newPresenceString2.filter((x) => !oldPresenceString2.includes(x));
console.log(oldPresenceString2);
console.log(oldPresenceString2 == newPresenceString2);
