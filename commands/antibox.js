const fs = require("fs");
const path = require("path");
const https = require("https");

const cacheDir = "./cache/antibox";

if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

module.exports = {
    name: "/antibox",

    run: async function (api, event, args = []) {

        const threadID = event.threadID;
        const configFile = path.join(
            cacheDir,
            `${threadID}.json`
        );

        // ===== ANTI ẢNH =====
        if (event.logMessageType === "log:thread-image") {

            if (!fs.existsSync(configFile)) return;

            const data = JSON.parse(
                fs.readFileSync(configFile, "utf8")
            );

            if (!data.enabled) return;

            const imagePath = path.join(
                cacheDir,
                data.imageFile
            );

            if (!fs.existsSync(imagePath)) {
                return api.sendMessage(
                    "❌ Không tìm thấy ảnh backup!",
                    threadID
                );
            }

            console.log(
                "changeGroupImage =",
                typeof api.changeGroupImage
            );

            if (typeof api.changeGroupImage !== "function") {

                return api.sendMessage(
                    "❌ FCA không hỗ trợ đổi ảnh nhóm!",
                    threadID
                );
            }

            api.changeGroupImage(
                fs.createReadStream(imagePath),
                threadID,
                (err) => {

                    if (err) {
                        console.log(err);

                        return api.sendMessage(
                            "❌ Khôi phục ảnh thất bại!",
                            threadID
                        );
                    }

                    api.sendMessage(
                        "✅ Đã khôi phục ảnh nhóm!",
                        threadID
                    );

                }
            );

            return;
        }

        // ===== ANTI TÊN =====
        if (event.logMessageType === "log:thread-name") {

            if (!fs.existsSync(configFile)) return;

            const data = JSON.parse(
                fs.readFileSync(configFile, "utf8")
            );

            if (!data.enabled) return;

            setTimeout(() => {

                api.setTitle(
                    data.threadName,
                    threadID,
                    (err) => {

                        if (err) {
                            console.log(err);
                            return;
                        }

                        api.sendMessage(
                            `⚠️ Đã khôi phục tên nhóm:\n${data.threadName}`,
                            threadID
                        );

                    }
                );

            }, 2000);

            return;
        }

        // ===== BỎ QUA EVENT KHÁC =====
        if (!event.body) return;

        // ===== HƯỚNG DẪN =====
        if (!args[1]) {

            return api.sendMessage(
                `📦 AntiBox

/antibox on
/antibox off
/antibox delete
/antibox set Tên mới`,
                threadID
            );

        }

        const option = args[1].toLowerCase();

        console.log(
            "changeGroupImage =",
            typeof api.changeGroupImage
        );
        // ===== ON =====
        if (option === "on") {

            if (fs.existsSync(configFile)) {

                const data = JSON.parse(
                    fs.readFileSync(configFile, "utf8")
                );

                data.enabled = true;

                fs.writeFileSync(
                    configFile,
                    JSON.stringify(data, null, 2)
                );

                return api.sendMessage(
                    `✅ AntiBox ON\n📌 Tên đang bảo vệ:\n${data.threadName}`,
                    threadID
                );
            }

            const info =
                await api.getThreadInfo(threadID);
            const imageFile = path.join(
                cacheDir,
                `${threadID}.jpg`
            );

            if (info.imageSrc) {

                const stream =
                    fs.createWriteStream(imageFile);

                https.get(info.imageSrc, (res) => {
                    res.pipe(stream);
                });

            }

            fs.writeFileSync(
                configFile,
                JSON.stringify({
                    enabled: true,
                    threadName: info.threadName || "Nhóm Chat",
                    imageFile: `${threadID}.jpg`
                }, null, 2)
            );

            return api.sendMessage(
                `✅ AntiBox ON\n📌 Đã lưu tên:\n${info.threadName}`,
                threadID
            );
        }

        // ===== SET =====
        if (option === "set") {

            const newName =
                args.slice(2).join(" ");

            if (!newName) {

                return api.sendMessage(
                    "❌ Dùng: /antibox set Tên mới",
                    threadID
                );

            }

            let data = {
                enabled: true,
                threadName: newName
            };

            if (fs.existsSync(configFile)) {

                data = JSON.parse(
                    fs.readFileSync(
                        configFile,
                        "utf8"
                    )
                );

                data.threadName = newName;

            }

            fs.writeFileSync(
                configFile,
                JSON.stringify(
                    data,
                    null,
                    2
                )
            );

            return api.sendMessage(
                `✅ Đã đổi tên AntiBox thành:\n${newName}`,
                threadID
            );
        }

        // ===== OFF =====
        if (option === "off") {

            if (fs.existsSync(configFile)) {

                const data = JSON.parse(
                    fs.readFileSync(
                        configFile,
                        "utf8"
                    )
                );

                data.enabled = false;

                fs.writeFileSync(
                    configFile,
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                );
            }

            return api.sendMessage(
                "❌ AntiBox OFF",
                threadID
            );
        }

        // ===== DELETE =====
        if (option === "delete") {

            if (fs.existsSync(configFile)) {
                fs.unlinkSync(configFile);
            }

            const imageFile = path.join(
                cacheDir,
                `${threadID}.jpg`
            );

            if (fs.existsSync(imageFile)) {
                fs.unlinkSync(imageFile);
            }

            return api.sendMessage(
                "🗑️ Đã xóa dữ liệu AntiBox!",
                threadID
            );
        }

    }
};