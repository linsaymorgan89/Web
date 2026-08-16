import rss from '@astrojs/rss';
import { posts } from '../data/posts';

export function GET(context) {
  return rss({
    title: 'The Erotic Morgan',
    description: 'Weekly blog by Morgan Alexander: touring announcements, client etiquette guides, behind-the-scenes.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.title,
      description: p.answer,
      pubDate: new Date(p.date + 'T00:00:00'),
      link: `/blog/${p.slug}/`,
      categories: [p.category],
    })),
    customData: '<language>en-us</language>',
  });
}
