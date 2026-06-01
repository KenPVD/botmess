module.exports = {

name: "joinleave",

run: async function(api, event) {

// Người vào nhóm
if (
event.logMessageType ===
"log:subscribe"
) {

const users =
event.logMessageData.addedParticipants;

for (const user of users) {

api.sendMessage(
`🎉 CHÀO MỪNG ${user.fullName} 🎉

FB: https://www.facebook.com/profile.php?id=${user.userFbId}

🌍 Địa chỉ máy chủ:
gacon.cloud-ip.cc

🥳 Chúc bạn chơi vui vẻ!`,
event.threadID
);

}

}

// Người rời nhóm hoặc bị kick
if (
event.logMessageType ===
"log:unsubscribe"
) {

const leftID =
event.logMessageData.leftParticipantFbId;

// Bot bị kick
if (
leftID ==
api.getCurrentUserID()
) return;

api.getUserInfo(
leftID,
(err, data) => {

const name =
data?.[leftID]?.name ||
"Member";

api.sendMessage(
`😢 Bạn ${name}

https://www.facebook.com/profile.php?id=${leftID}

Đi rồi, tạm biệt 👋`,
event.threadID
);

}
);

}

}

};
