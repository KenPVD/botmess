module.exports = {
    name: "/doiten",

    run: async function(api, event, args) {

        let uid;

        // Reply
        if (event.messageReply) {
            uid = event.messageReply.senderID;
        }

        // Tag
        else if (
            event.mentions &&
            Object.keys(event.mentions).length > 0
        ) {
            uid = Object.keys(event.mentions)[0];
        }

        else {
            return api.sendMessage(
                "❌ Reply hoặc tag người cần đổi biệt danh!",
                event.threadID
            );
        }

        let nickname;

        // Nếu reply
        if (event.messageReply) {
            nickname = args.slice(1).join(" ");
        }

        // Nếu tag
        else {
            nickname = args
                .slice(1)
                .join(" ")
                .replace(
                    Object.values(event.mentions)[0],
                    ""
                )
                .trim();
        }

        if (!nickname) {
            return api.sendMessage(
                "❌ Dùng:\n/doiten @user biệt_danh\nhoặc reply người cần đổi rồi gõ:\n/doiten biệt_danh",
                event.threadID
            );
        }

        api.changeNickname(
            nickname,
            event.threadID,
            uid,
            (err) => {

                if (err) {
                    console.log(err);
                    return api.sendMessage(
                        "❌ Đổi biệt danh thất bại!",
                        event.threadID
                    );
                }

                api.sendMessage(
                    `✅ Đã đổi biệt danh thành: ${nickname}`,
                    event.threadID
                );

            }
        );
    }
};