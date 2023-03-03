export default {
    onload: ({ extensionAPI }) => {
        extensionAPI.ui.commandPalette.addCommand({
            label: "Import today's xkcd comic",
            callback: () => {
                const uid = window.roamAlphaAPI.ui.getFocusedBlock()?.["block-uid"];
                if (uid == undefined) {
                    alert("Please make sure to focus a block before importing from xkcd");
                    return;
                } else {
                    window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: "Loading...".toString(), open: true } });
                }
                fetchXKCD().then(async (blocks) => {
                    await window.roamAlphaAPI.updateBlock(
                        { block: { uid: uid, string: blocks[0].text.toString(), open: true } });
                    for (var i = 0; i < blocks[0].children.length; i++) {
                        var thisBlock = window.roamAlphaAPI.util.generateUID();
                        await window.roamAlphaAPI.createBlock({
                            location: { "parent-uid": uid, order: i + 1 },
                            block: { string: blocks[0].children[i].text.toString(), uid: thisBlock }
                        });
                    }
                });
            },
        });

        const args = {
            text: "XKCD",
            help: "Import today's xkcd comic",
            handler: (context) => fetchXKCD,
        };

        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.registerCommand(args);
        } else {
            document.body.addEventListener(
                `roamjs:smartblocks:loaded`,
                () =>
                    window.roamjs?.extension.smartblocks &&
                    window.roamjs.extension.smartblocks.registerCommand(args)
            );
        }

        var requestOptions = {
            method: 'GET',
            timeout: 0,
            redirect: 'follow'
        };

        async function fetchXKCD() {
            var url = "https://r-x.onrender.com";
            const response = await fetch(url, requestOptions);
            const data = await response.text();
            var responses = await JSON.parse(data);
            var string = "![](" + responses.img.toString() + ")";
            var alt = "" + responses.alt.toString() + "";
            var title = "" + responses.safe_title.toString() + "";
            return [{
                text: "" + string + "",
                children: [
                    { text: "Title:: " + title + "" },
                    { text: "Description:: " + alt + "" },
                ]
            },];
        };
    },
    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            window.roamjs.extension.smartblocks.unregisterCommand("XKCD");
        }
    }
}