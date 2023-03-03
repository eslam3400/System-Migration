import { FormData } from 'formdata-node';
import fetch, { blobFrom } from 'node-fetch';
import axios from 'axios';
import screens from './screens.json' assert { type: "json" }
import apps from './apps.json'assert { type: "json" }
import patterns from "./patterns.json" assert { type: "json" };

const tags = patterns.filter(x => x.parent_id != "")

const script = async () => {
    const appIds = []
    for (let i = 0; i < apps.length; i++) {
        const app = apps[i];
        const appResponse = await axios.post("http://127.0.0.1:1337/api/apps", {
            data:
            {
                old_app_id: app.id,
                name: app.name,
                slug: app.slug,
                tag_line: app.tagline,
                store_link: app.storelink,
                copy_right: app.copyright,
                is_published: app.is_published,
                platform: { connect: [app.platform_id] },
                categories: { connect: [app.category_id] },
            }
        })

        const file = await blobFrom(`./icons/${app.icon}`, 'image/png');
        if (!file) continue;
        const form = new FormData();

        form.append('files', file, app.icon);
        form.append('refId', appResponse.data.data.id);
        form.append('ref', "api::app.app");
        form.append('field', "icon");

        await fetch('http://127.0.0.1:1337/api/upload', { method: 'post', body: form });
        appIds.push({ oldAppId: app.id, id: appResponse.data.data.id })
    }

    for (let i = 0; i < screens.length; i++) {
        const screen = screens[i];
        let screenTags = []
        if (screen.tags[0] != null) {
            screenTags = screen.tags.split(',').map(x => Number(x))
            screenTags = screenTags.map(x => tags.findIndex(x => x.id == x) + 1)
        }
        const screenResponse = await axios.post('http://127.0.0.1:1337/api/screens', {
            data: {
                order: screen.ord,
                is_published: screen.is_published,
                is_showcase: screen.is_showcase,
                tags: { connect: screenTags },
                app: { connect: [appIds.find(x => x.oldAppId == screen.app_id).id] }
            }
        })

        const file = await blobFrom(`./screens/${screen.app_id}/${screen.url}`, 'image/png');
        if (!file) continue;
        const form = new FormData();

        form.append('files', file, screen.url);
        form.append('refId', screenResponse.data.data.id);
        form.append('ref', "api::screen.screen");
        form.append('field', "screen");

        await fetch('http://127.0.0.1:1337/api/upload', { method: 'post', body: form });
    }
}

script();