import axios from 'axios';
import categories from './categories.json' assert { type: "json" }
import platforms from './platforms.json' assert { type: "json" }
import patterns from "./patterns.json" assert { type: "json" };

categories.forEach(async category => await axios.post("http://127.0.0.1:1337/api/categories", { data: { name: category.name } }));
platforms.forEach(async platform => await axios.post("http://127.0.0.1:1337/api/platforms", { data: { name: platform.name } }));

const tagCategories = patterns.filter(x => x.parent_id == "")
const tags = patterns.filter(x => x.parent_id != "")

const seed = async () => {
  const catIds = []
  for (let i = 0; i < tagCategories.length; i++) {
    const category = tagCategories[i];
    const categoryResponse = await axios.post("http://127.0.0.1:1337/api/tag-categories", { data: { name: category.name } })
    catIds.push({ oldCatId: category.id, id: categoryResponse.data.data.id })
  }

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    await axios.post('http://127.0.0.1:1337/api/tags', {
      data: {
        name: tag.name,
        old_tag_id: tag.id,
        tag_categories: { connect: [catIds.find(x => x.oldCatId == tag.parent_id).id] }
      }
    })

  }
}

seed().catch(err => console.log(err.message));