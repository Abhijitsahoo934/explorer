import type { WorkspaceTemplate } from './explorerService';

export const COMMUNITY_TEMPLATE_LIBRARY: ReadonlyArray<WorkspaceTemplate> = [
  {
    name: 'Startup Founder OS',
    folders: [
      {
        name: 'Business Strategy',
        apps: [
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Miro', url: 'https://miro.com' },
          { name: 'Whimsical', url: 'https://whimsical.com' },
        ],
      },
      {
        name: 'Product Management',
        apps: [
          { name: 'Jira', url: 'https://www.atlassian.com/software/jira' },
          { name: 'Trello', url: 'https://trello.com' },
          { name: 'ClickUp', url: 'https://clickup.com' },
        ],
      },
      {
        name: 'Fundraising',
        apps: [
          { name: 'Crunchbase', url: 'https://www.crunchbase.com' },
          { name: 'AngelList', url: 'https://angel.co' },
          { name: 'DocSend', url: 'https://www.docsend.com' },
        ],
      },
      {
        name: 'Finance & Accounting',
        apps: [
          { name: 'QuickBooks', url: 'https://quickbooks.intuit.com' },
          { name: 'Stripe Dashboard', url: 'https://dashboard.stripe.com' },
          { name: 'Wave Accounting', url: 'https://www.waveapps.com' },
        ],
      },
      {
        name: 'Marketing & Sales',
        apps: [
          { name: 'HubSpot', url: 'https://www.hubspot.com' },
          { name: 'Canva', url: 'https://www.canva.com' },
          { name: 'LinkedIn Ads', url: 'https://www.linkedin.com/campaignmanager' },
        ],
      },
      {
        name: 'Networking & Community',
        apps: [
          { name: 'Slack', url: 'https://slack.com' },
          { name: 'Discord', url: 'https://discord.com' },
          { name: 'Twitter', url: 'https://twitter.com' },
        ],
      },
      {
        name: 'Learning & Productivity',
        apps: [
          { name: 'Coursera', url: 'https://www.coursera.org' },
          { name: 'Harvard Business Review', url: 'https://hbr.org' },
          { name: 'Google Calendar', url: 'https://calendar.google.com' },
        ],
      },
    ],
  },
  {
    name: 'Software Developer OS',
    folders: [
      {
        name: 'Code Repositories',
        apps: [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'GitLab', url: 'https://gitlab.com' },
          { name: 'Bitbucket', url: 'https://bitbucket.org' },
        ],
      },
      {
        name: 'Development Environment',
        apps: [
          { name: 'CodeSandbox', url: 'https://codesandbox.io' },
          { name: 'Replit', url: 'https://replit.com' },
          { name: 'StackBlitz', url: 'https://stackblitz.com' },
        ],
      },
      {
        name: 'API & Testing',
        apps: [
          { name: 'Postman', url: 'https://www.postman.com' },
          { name: 'Insomnia', url: 'https://insomnia.rest' },
          { name: 'Swagger Editor', url: 'https://editor.swagger.io' },
        ],
      },
      {
        name: 'Databases',
        apps: [
          { name: 'MongoDB Atlas', url: 'https://www.mongodb.com/cloud/atlas' },
          { name: 'Supabase', url: 'https://supabase.com' },
          { name: 'Firebase Console', url: 'https://console.firebase.google.com' },
        ],
      },
      {
        name: 'Documentation',
        apps: [
          { name: 'DevDocs', url: 'https://devdocs.io' },
          { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
          { name: 'Read the Docs', url: 'https://readthedocs.org' },
        ],
      },
      {
        name: 'DevOps & Deployment',
        apps: [
          { name: 'Vercel', url: 'https://vercel.com' },
          { name: 'Netlify', url: 'https://www.netlify.com' },
          { name: 'Render', url: 'https://render.com' },
        ],
      },
      {
        name: 'Learning & Community',
        apps: [
          { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
          { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' },
          { name: 'Dev.to', url: 'https://dev.to' },
        ],
      },
    ],
  },
  {
    name: 'Software Developer OS (AI Powered)',
    folders: [
      {
        name: 'Coding Platforms',
        apps: [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'GitLab', url: 'https://gitlab.com' },
          { name: 'CodePen', url: 'https://codepen.io' },
        ],
      },
      {
        name: 'AI Coding Assistants',
        apps: [
          { name: 'GitHub Copilot', url: 'https://github.com/features/copilot' },
          { name: 'Tabnine', url: 'https://www.tabnine.com' },
          { name: 'Cursor', url: 'https://www.cursor.com' },
          { name: 'Replit Ghostwriter', url: 'https://replit.com/ghostwriter' },
          { name: 'Codeium', url: 'https://codeium.com' },
        ],
      },
      {
        name: 'Testing & Debugging',
        apps: [
          { name: 'Postman', url: 'https://www.postman.com' },
          { name: 'Sentry', url: 'https://sentry.io' },
          { name: 'LogRocket', url: 'https://logrocket.com' },
        ],
      },
      {
        name: 'Databases & Backend',
        apps: [
          { name: 'Supabase', url: 'https://supabase.com' },
          { name: 'PlanetScale', url: 'https://planetscale.com' },
          { name: 'Railway', url: 'https://railway.app' },
        ],
      },
      {
        name: 'Deployment',
        apps: [
          { name: 'Vercel', url: 'https://vercel.com' },
          { name: 'Netlify', url: 'https://www.netlify.com' },
          { name: 'Render', url: 'https://render.com' },
        ],
      },
      {
        name: 'Knowledge & Docs',
        apps: [
          { name: 'MDN', url: 'https://developer.mozilla.org' },
          { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
          { name: 'DevDocs', url: 'https://devdocs.io' },
        ],
      },
      {
        name: 'AI Learning',
        apps: [
          { name: 'Hugging Face', url: 'https://huggingface.co' },
          { name: 'OpenAI Docs', url: 'https://platform.openai.com/docs' },
          { name: 'Google AI Studio', url: 'https://aistudio.google.com' },
        ],
      },
    ],
  },
  {
    name: 'UI/UX Designer OS',
    folders: [
      {
        name: 'Design Tools',
        apps: [
          { name: 'Figma', url: 'https://www.figma.com' },
          { name: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html' },
          { name: 'Sketch', url: 'https://www.sketch.com' },
        ],
      },
      {
        name: 'Prototyping & Wireframing',
        apps: [
          { name: 'Marvel', url: 'https://marvelapp.com' },
          { name: 'Axure RP', url: 'https://www.axure.com' },
          { name: 'Whimsical', url: 'https://whimsical.com' },
        ],
      },
      {
        name: 'Inspiration',
        apps: [
          { name: 'Dribbble', url: 'https://dribbble.com' },
          { name: 'Behance', url: 'https://www.behance.net' },
          { name: 'Pinterest', url: 'https://www.pinterest.com' },
        ],
      },
      {
        name: 'Color, Fonts & Assets',
        apps: [
          { name: 'Coolors', url: 'https://coolors.co' },
          { name: 'Google Fonts', url: 'https://fonts.google.com' },
          { name: 'Iconfinder', url: 'https://www.iconfinder.com' },
        ],
      },
      {
        name: 'User Research',
        apps: [
          { name: 'Hotjar', url: 'https://www.hotjar.com' },
          { name: 'Maze', url: 'https://maze.co' },
          { name: 'Typeform', url: 'https://www.typeform.com' },
        ],
      },
      {
        name: 'Collaboration',
        apps: [
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Miro', url: 'https://miro.com' },
          { name: 'Slack', url: 'https://slack.com' },
        ],
      },
      {
        name: 'Learning',
        apps: [
          { name: 'Coursera UX Courses', url: 'https://www.coursera.org' },
          { name: 'NNGroup', url: 'https://www.nngroup.com' },
          { name: 'UX Planet', url: 'https://uxplanet.org' },
        ],
      },
    ],
  },
  {
    name: 'Video Editor OS',
    folders: [
      {
        name: 'Editing Software',
        apps: [
          { name: 'Adobe Premiere Pro', url: 'https://www.adobe.com/products/premiere.html' },
          { name: 'DaVinci Resolve', url: 'https://www.blackmagicdesign.com/products/davinciresolve/' },
          { name: 'Final Cut Pro', url: 'https://www.apple.com/final-cut-pro/' },
        ],
      },
      {
        name: 'Motion Graphics & Effects',
        apps: [
          { name: 'After Effects', url: 'https://www.adobe.com/products/aftereffects.html' },
          { name: 'Blender', url: 'https://www.blender.org' },
          { name: 'Cinema 4D', url: 'https://www.maxon.net/cinema-4d' },
        ],
      },
      {
        name: 'Stock Footage & Assets',
        apps: [
          { name: 'Storyblocks', url: 'https://www.storyblocks.com' },
          { name: 'Pexels Videos', url: 'https://www.pexels.com/videos/' },
          { name: 'Envato Elements', url: 'https://elements.envato.com' },
        ],
      },
      {
        name: 'Audio & Music',
        apps: [
          { name: 'Epidemic Sound', url: 'https://www.epidemicsound.com' },
          { name: 'Artlist', url: 'https://artlist.io' },
          { name: 'Audacity', url: 'https://www.audacityteam.org' },
        ],
      },
      {
        name: 'AI Tools',
        apps: [
          { name: 'Runway', url: 'https://runwayml.com' },
          { name: 'Descript', url: 'https://www.descript.com' },
          { name: 'Kapwing', url: 'https://www.kapwing.com' },
        ],
      },
      {
        name: 'Publishing Platforms',
        apps: [
          { name: 'YouTube Studio', url: 'https://studio.youtube.com' },
          { name: 'Vimeo', url: 'https://vimeo.com' },
          { name: 'Instagram Creator Studio', url: 'https://business.facebook.com/creatorstudio' },
        ],
      },
      {
        name: 'Learning & Inspiration',
        apps: [
          { name: 'Film Riot', url: 'https://www.youtube.com/user/filmriot' },
          { name: 'No Film School', url: 'https://nofilmschool.com' },
          { name: 'Cinecom.net', url: 'https://www.youtube.com/c/CinecomNet' },
        ],
      },
    ],
  },
  {
    name: 'AI/ML Engineer OS',
    folders: [
      {
        name: 'Development Environments',
        apps: [
          { name: 'Google Colab', url: 'https://colab.research.google.com' },
          { name: 'Kaggle Notebooks', url: 'https://www.kaggle.com/code' },
          { name: 'JupyterLab', url: 'https://jupyter.org' },
        ],
      },
      {
        name: 'Frameworks & Libraries',
        apps: [
          { name: 'TensorFlow', url: 'https://www.tensorflow.org' },
          { name: 'PyTorch', url: 'https://pytorch.org' },
          { name: 'Scikit-learn', url: 'https://scikit-learn.org' },
        ],
      },
      {
        name: 'Model Hosting & Deployment',
        apps: [
          { name: 'Hugging Face Hub', url: 'https://huggingface.co' },
          { name: 'Weights & Biases', url: 'https://wandb.ai' },
          { name: 'MLflow', url: 'https://mlflow.org' },
        ],
      },
      {
        name: 'Data Management',
        apps: [
          { name: 'BigQuery', url: 'https://cloud.google.com/bigquery' },
          { name: 'Snowflake', url: 'https://www.snowflake.com' },
          { name: 'DVC', url: 'https://dvc.org' },
        ],
      },
      {
        name: 'Experiment Tracking',
        apps: [
          { name: 'Comet ML', url: 'https://www.comet.com' },
          { name: 'Neptune AI', url: 'https://neptune.ai' },
          { name: 'ClearML', url: 'https://clear.ml' },
        ],
      },
      {
        name: 'Learning & Research',
        apps: [
          { name: 'ArXiv', url: 'https://arxiv.org' },
          { name: 'Papers with Code', url: 'https://paperswithcode.com' },
          { name: 'Distill', url: 'https://distill.pub' },
        ],
      },
      {
        name: 'AI APIs',
        apps: [
          { name: 'OpenAI', url: 'https://platform.openai.com' },
          { name: 'Anthropic', url: 'https://www.anthropic.com' },
          { name: 'Google AI Studio', url: 'https://aistudio.google.com' },
        ],
      },
    ],
  },
  {
    name: 'Content Creator OS',
    folders: [
      {
        name: 'Content Planning',
        apps: [
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Trello', url: 'https://trello.com' },
          { name: 'Google Calendar', url: 'https://calendar.google.com' },
        ],
      },
      {
        name: 'Graphic Design',
        apps: [
          { name: 'Canva', url: 'https://www.canva.com' },
          { name: 'Adobe Express', url: 'https://www.adobe.com/express/' },
          { name: 'Figma', url: 'https://www.figma.com' },
        ],
      },
      {
        name: 'Video Editing',
        apps: [
          { name: 'CapCut', url: 'https://www.capcut.com' },
          { name: 'Descript', url: 'https://www.descript.com' },
          { name: 'DaVinci Resolve', url: 'https://www.blackmagicdesign.com/products/davinciresolve/' },
        ],
      },
      {
        name: 'Social Publishing',
        apps: [
          { name: 'YouTube Studio', url: 'https://studio.youtube.com' },
          { name: 'Instagram Creator Studio', url: 'https://business.facebook.com/creatorstudio' },
          { name: 'TikTok Studio', url: 'https://www.tiktok.com/studio' },
        ],
      },
      {
        name: 'Audience & Analytics',
        apps: [
          { name: 'Google Analytics', url: 'https://analytics.google.com' },
          { name: 'TubeBuddy', url: 'https://www.tubebuddy.com' },
          { name: 'Social Blade', url: 'https://socialblade.com' },
        ],
      },
      {
        name: 'Monetization',
        apps: [
          { name: 'Patreon', url: 'https://www.patreon.com' },
          { name: 'Gumroad', url: 'https://gumroad.com' },
          { name: 'Ko-fi', url: 'https://ko-fi.com' },
        ],
      },
      {
        name: 'Learning & Inspiration',
        apps: [
          { name: 'Skillshare', url: 'https://www.skillshare.com' },
          { name: 'Creator Insider', url: 'https://www.youtube.com/user/CreatorInsider' },
          { name: 'HubSpot Blog', url: 'https://blog.hubspot.com' },
        ],
      },
    ],
  },
  {
    name: 'AI Content System OS',
    folders: [
      {
        name: 'AI Writing',
        apps: [
          { name: 'ChatGPT', url: 'https://chat.openai.com' },
          { name: 'Claude', url: 'https://claude.ai' },
          { name: 'Jasper', url: 'https://www.jasper.ai' },
        ],
      },
      {
        name: 'Design & Visuals',
        apps: [
          { name: 'Canva', url: 'https://www.canva.com' },
          { name: 'Midjourney', url: 'https://www.midjourney.com' },
          { name: 'Leonardo AI', url: 'https://leonardo.ai' },
        ],
      },
      {
        name: 'Video AI Tools',
        apps: [
          { name: 'Runway', url: 'https://runwayml.com' },
          { name: 'Pictory', url: 'https://pictory.ai' },
          { name: 'Synthesia', url: 'https://www.synthesia.io' },
        ],
      },
      {
        name: 'Publishing & Scheduling',
        apps: [
          { name: 'Buffer', url: 'https://buffer.com' },
          { name: 'Hootsuite', url: 'https://hootsuite.com' },
          { name: 'Later', url: 'https://later.com' },
        ],
      },
      {
        name: 'SEO & Optimization',
        apps: [
          { name: 'Surfer SEO', url: 'https://surferseo.com' },
          { name: 'Semrush', url: 'https://www.semrush.com' },
          { name: 'Ahrefs', url: 'https://ahrefs.com' },
        ],
      },
      {
        name: 'Analytics & Growth',
        apps: [
          { name: 'Google Analytics', url: 'https://analytics.google.com' },
          { name: 'YouTube Studio', url: 'https://studio.youtube.com' },
          { name: 'Meta Business Suite', url: 'https://business.facebook.com' },
        ],
      },
      {
        name: 'Automation',
        apps: [
          { name: 'Zapier', url: 'https://zapier.com' },
          { name: 'Make', url: 'https://www.make.com' },
          { name: 'n8n', url: 'https://n8n.io' },
        ],
      },
    ],
  },
  {
    name: 'Blogger OS',
    folders: [
      {
        name: 'Writing & Drafting',
        apps: [
          { name: 'Google Docs', url: 'https://docs.google.com' },
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Grammarly', url: 'https://www.grammarly.com' },
        ],
      },
      {
        name: 'Blog Platforms',
        apps: [
          { name: 'WordPress', url: 'https://wordpress.com' },
          { name: 'Medium', url: 'https://medium.com' },
          { name: 'Ghost', url: 'https://ghost.org' },
        ],
      },
      {
        name: 'SEO & Keyword Research',
        apps: [
          { name: 'Ahrefs', url: 'https://ahrefs.com' },
          { name: 'Ubersuggest', url: 'https://neilpatel.com/ubersuggest/' },
          { name: 'Google Keyword Planner', url: 'https://ads.google.com/home/tools/keyword-planner/' },
        ],
      },
      {
        name: 'Design & Media',
        apps: [
          { name: 'Canva', url: 'https://www.canva.com' },
          { name: 'Unsplash', url: 'https://unsplash.com' },
          { name: 'Pexels', url: 'https://www.pexels.com' },
        ],
      },
      {
        name: 'Analytics & Tracking',
        apps: [
          { name: 'Google Analytics', url: 'https://analytics.google.com' },
          { name: 'Google Search Console', url: 'https://search.google.com/search-console' },
          { name: 'Hotjar', url: 'https://www.hotjar.com' },
        ],
      },
      {
        name: 'Monetization',
        apps: [
          { name: 'Google AdSense', url: 'https://www.google.com/adsense/' },
          { name: 'Amazon Associates', url: 'https://affiliate-program.amazon.com' },
          { name: 'Buy Me a Coffee', url: 'https://www.buymeacoffee.com' },
        ],
      },
      {
        name: 'Promotion & Growth',
        apps: [
          { name: 'Pinterest', url: 'https://www.pinterest.com' },
          { name: 'Buffer', url: 'https://buffer.com' },
          { name: 'Mailchimp', url: 'https://mailchimp.com' },
        ],
      },
    ],
  },
  {
    name: 'Digital Marketer OS',
    folders: [
      {
        name: 'Campaign Planning',
        apps: [
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Trello', url: 'https://trello.com' },
          { name: 'Miro', url: 'https://miro.com' },
        ],
      },
      {
        name: 'SEO & Content Marketing',
        apps: [
          { name: 'Ahrefs', url: 'https://ahrefs.com' },
          { name: 'Semrush', url: 'https://www.semrush.com' },
          { name: 'Surfer SEO', url: 'https://surferseo.com' },
        ],
      },
      {
        name: 'Social Media Management',
        apps: [
          { name: 'Buffer', url: 'https://buffer.com' },
          { name: 'Hootsuite', url: 'https://hootsuite.com' },
          { name: 'Meta Business Suite', url: 'https://business.facebook.com' },
        ],
      },
      {
        name: 'Email Marketing',
        apps: [
          { name: 'Mailchimp', url: 'https://mailchimp.com' },
          { name: 'ConvertKit', url: 'https://convertkit.com' },
          { name: 'Brevo', url: 'https://www.brevo.com' },
        ],
      },
      {
        name: 'Ad Platforms',
        apps: [
          { name: 'Google Ads', url: 'https://ads.google.com' },
          { name: 'LinkedIn Campaign Manager', url: 'https://www.linkedin.com/campaignmanager' },
          { name: 'TikTok Ads Manager', url: 'https://ads.tiktok.com' },
        ],
      },
      {
        name: 'Analytics & Reporting',
        apps: [
          { name: 'Google Analytics', url: 'https://analytics.google.com' },
          { name: 'Looker Studio', url: 'https://lookerstudio.google.com' },
          { name: 'Hotjar', url: 'https://www.hotjar.com' },
        ],
      },
      {
        name: 'Automation',
        apps: [
          { name: 'Zapier', url: 'https://zapier.com' },
          { name: 'Make', url: 'https://www.make.com' },
          { name: 'HubSpot', url: 'https://www.hubspot.com' },
        ],
      },
    ],
  },
  {
    name: 'Data Analyst OS',
    folders: [
      {
        name: 'Data Sources',
        apps: [
          { name: 'Google Sheets', url: 'https://sheets.google.com' },
          { name: 'Airtable', url: 'https://airtable.com' },
          { name: 'Kaggle Datasets', url: 'https://www.kaggle.com/datasets' },
        ],
      },
      {
        name: 'Data Cleaning & Transformation',
        apps: [
          { name: 'OpenRefine', url: 'https://openrefine.org' },
          { name: 'Alteryx', url: 'https://www.alteryx.com' },
          { name: 'Trifacta', url: 'https://www.alteryx.com/trifacta' },
        ],
      },
      {
        name: 'Analysis Tools',
        apps: [
          { name: 'Jupyter Notebook', url: 'https://jupyter.org' },
          { name: 'RStudio Cloud', url: 'https://posit.cloud' },
          { name: 'Google Colab', url: 'https://colab.research.google.com' },
        ],
      },
      {
        name: 'Visualization',
        apps: [
          { name: 'Tableau', url: 'https://www.tableau.com' },
          { name: 'Power BI', url: 'https://powerbi.microsoft.com' },
          { name: 'Looker Studio', url: 'https://lookerstudio.google.com' },
        ],
      },
      {
        name: 'Databases & SQL',
        apps: [
          { name: 'Mode Analytics', url: 'https://mode.com' },
          { name: 'SQL Fiddle', url: 'http://sqlfiddle.com' },
          { name: 'DB Fiddle', url: 'https://www.db-fiddle.com' },
        ],
      },
      {
        name: 'Reporting & Dashboards',
        apps: [
          { name: 'Google Data Studio', url: 'https://lookerstudio.google.com' },
          { name: 'Metabase', url: 'https://www.metabase.com' },
          { name: 'Redash', url: 'https://redash.io' },
        ],
      },
      {
        name: 'Learning & Resources',
        apps: [
          { name: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' },
          { name: 'DataCamp', url: 'https://www.datacamp.com' },
          { name: 'Towards Data Science', url: 'https://towardsdatascience.com' },
        ],
      },
    ],
  },
  {
    name: 'Product Manager OS',
    folders: [
      {
        name: 'Roadmapping & Planning',
        apps: [
          { name: 'Aha!', url: 'https://www.aha.io' },
          { name: 'Productboard', url: 'https://www.productboard.com' },
          { name: 'Notion', url: 'https://www.notion.so' },
        ],
      },
      {
        name: 'Task & Sprint Management',
        apps: [
          { name: 'Jira', url: 'https://www.atlassian.com/software/jira' },
          { name: 'ClickUp', url: 'https://clickup.com' },
          { name: 'Asana', url: 'https://asana.com' },
        ],
      },
      {
        name: 'User Research',
        apps: [
          { name: 'Typeform', url: 'https://www.typeform.com' },
          { name: 'Maze', url: 'https://maze.co' },
          { name: 'Hotjar', url: 'https://www.hotjar.com' },
        ],
      },
      {
        name: 'Analytics & Metrics',
        apps: [
          { name: 'Mixpanel', url: 'https://mixpanel.com' },
          { name: 'Amplitude', url: 'https://amplitude.com' },
          { name: 'Google Analytics', url: 'https://analytics.google.com' },
        ],
      },
      {
        name: 'Wireframing & Prototyping',
        apps: [
          { name: 'Figma', url: 'https://www.figma.com' },
          { name: 'Whimsical', url: 'https://whimsical.com' },
          { name: 'Balsamiq', url: 'https://balsamiq.com' },
        ],
      },
      {
        name: 'Communication & Collaboration',
        apps: [
          { name: 'Slack', url: 'https://slack.com' },
          { name: 'Confluence', url: 'https://www.atlassian.com/software/confluence' },
          { name: 'Miro', url: 'https://miro.com' },
        ],
      },
      {
        name: 'Learning & Frameworks',
        apps: [
          { name: 'Mind the Product', url: 'https://www.mindtheproduct.com' },
          { name: 'Reforge', url: 'https://www.reforge.com' },
          { name: 'Product School', url: 'https://productschool.com' },
        ],
      },
    ],
  },
  {
    name: 'Student OS',
    folders: [
      {
        name: 'Study & Notes',
        apps: [
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'OneNote', url: 'https://www.onenote.com' },
          { name: 'Google Keep', url: 'https://keep.google.com' },
        ],
      },
      {
        name: 'Learning Platforms',
        apps: [
          { name: 'Coursera', url: 'https://www.coursera.org' },
          { name: 'Khan Academy', url: 'https://www.khanacademy.org' },
          { name: 'Udemy', url: 'https://www.udemy.com' },
        ],
      },
      {
        name: 'Assignments & Productivity',
        apps: [
          { name: 'Google Docs', url: 'https://docs.google.com' },
          { name: 'Trello', url: 'https://trello.com' },
          { name: 'Todoist', url: 'https://todoist.com' },
        ],
      },
      {
        name: 'Research & References',
        apps: [
          { name: 'Google Scholar', url: 'https://scholar.google.com' },
          { name: 'Mendeley', url: 'https://www.mendeley.com' },
          { name: 'Zotero', url: 'https://www.zotero.org' },
        ],
      },
      {
        name: 'Coding & Projects',
        apps: [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'Replit', url: 'https://replit.com' },
          { name: 'CodePen', url: 'https://codepen.io' },
        ],
      },
      {
        name: 'Exam Preparation',
        apps: [
          { name: 'Quizlet', url: 'https://quizlet.com' },
          { name: 'AnkiWeb', url: 'https://ankiweb.net' },
          { name: 'Brainscape', url: 'https://www.brainscape.com' },
        ],
      },
      {
        name: 'Career & Internships',
        apps: [
          { name: 'LinkedIn', url: 'https://www.linkedin.com' },
          { name: 'Internshala', url: 'https://internshala.com' },
          { name: 'Handshake', url: 'https://joinhandshake.com' },
        ],
      },
    ],
  },
  {
    name: 'Investor/Finance OS',
    folders: [
      {
        name: 'Market Tracking',
        apps: [
          { name: 'TradingView', url: 'https://www.tradingview.com' },
          { name: 'Yahoo Finance', url: 'https://finance.yahoo.com' },
          { name: 'Google Finance', url: 'https://www.google.com/finance' },
        ],
      },
      {
        name: 'Stock Research',
        apps: [
          { name: 'Screener', url: 'https://www.screener.in' },
          { name: 'TickerTape', url: 'https://www.tickertape.in' },
          { name: 'Moneycontrol', url: 'https://www.moneycontrol.com' },
        ],
      },
      {
        name: 'Portfolio Management',
        apps: [
          { name: 'Groww', url: 'https://groww.in' },
          { name: 'Zerodha Console', url: 'https://console.zerodha.com' },
          { name: 'INDmoney', url: 'https://www.indmoney.com' },
        ],
      },
      {
        name: 'Financial News',
        apps: [
          { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets' },
          { name: 'Bloomberg', url: 'https://www.bloomberg.com' },
          { name: 'CNBC', url: 'https://www.cnbc.com' },
        ],
      },
      {
        name: 'Crypto & Alternatives',
        apps: [
          { name: 'CoinMarketCap', url: 'https://coinmarketcap.com' },
          { name: 'CoinGecko', url: 'https://www.coingecko.com' },
          { name: 'Binance', url: 'https://www.binance.com' },
        ],
      },
      {
        name: 'Budgeting & Personal Finance',
        apps: [
          { name: 'Walnut', url: 'https://www.getwalnut.com' },
          { name: 'YNAB', url: 'https://www.ynab.com' },
          { name: 'Mint', url: 'https://mint.intuit.com' },
        ],
      },
      {
        name: 'Learning',
        apps: [
          { name: 'Investopedia', url: 'https://www.investopedia.com' },
          { name: 'Varsity by Zerodha', url: 'https://zerodha.com/varsity/' },
          { name: 'Coursera Finance Courses', url: 'https://www.coursera.org' },
        ],
      },
    ],
  },
  {
    name: 'AI Automation Engineer OS',
    folders: [
      {
        name: 'Automation Platforms',
        apps: [
          { name: 'Zapier', url: 'https://zapier.com' },
          { name: 'Make (Integromat)', url: 'https://www.make.com' },
          { name: 'n8n', url: 'https://n8n.io' },
        ],
      },
      {
        name: 'AI Model APIs',
        apps: [
          { name: 'OpenAI API', url: 'https://platform.openai.com' },
          { name: 'Anthropic Claude API', url: 'https://www.anthropic.com' },
          { name: 'Google Gemini API', url: 'https://ai.google.dev' },
        ],
      },
      {
        name: 'Workflow Orchestration',
        apps: [
          { name: 'Apache Airflow', url: 'https://airflow.apache.org' },
          { name: 'Prefect', url: 'https://www.prefect.io' },
          { name: 'Temporal', url: 'https://temporal.io' },
        ],
      },
      {
        name: 'Backend & Integrations',
        apps: [
          { name: 'Supabase', url: 'https://supabase.com' },
          { name: 'Firebase', url: 'https://firebase.google.com' },
          { name: 'Postman', url: 'https://www.postman.com' },
        ],
      },
      {
        name: 'Code & Development',
        apps: [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'Replit', url: 'https://replit.com' },
          { name: 'CodeSandbox', url: 'https://codesandbox.io' },
        ],
      },
      {
        name: 'Monitoring & Logging',
        apps: [
          { name: 'Sentry', url: 'https://sentry.io' },
          { name: 'Datadog', url: 'https://www.datadoghq.com' },
          { name: 'New Relic', url: 'https://newrelic.com' },
        ],
      },
      {
        name: 'Learning & Resources',
        apps: [
          { name: 'LangChain Docs', url: 'https://python.langchain.com' },
          { name: 'Hugging Face', url: 'https://huggingface.co' },
          { name: 'Towards Data Science', url: 'https://towardsdatascience.com' },
        ],
      },
    ],
  },
  {
    name: 'Mobile App Developer OS',
    folders: [
      {
        name: 'Development Tools',
        apps: [
          { name: 'Android Studio', url: 'https://developer.android.com/studio' },
          { name: 'Xcode', url: 'https://developer.apple.com/xcode/' },
          { name: 'Visual Studio Code', url: 'https://code.visualstudio.com' },
        ],
      },
      {
        name: 'Frameworks',
        apps: [
          { name: 'Flutter', url: 'https://flutter.dev' },
          { name: 'React Native', url: 'https://reactnative.dev' },
          { name: 'Ionic', url: 'https://ionicframework.com' },
        ],
      },
      {
        name: 'Backend & APIs',
        apps: [
          { name: 'Firebase', url: 'https://firebase.google.com' },
          { name: 'Supabase', url: 'https://supabase.com' },
          { name: 'Postman', url: 'https://www.postman.com' },
        ],
      },
      {
        name: 'Version Control',
        apps: [
          { name: 'GitHub', url: 'https://github.com' },
          { name: 'GitLab', url: 'https://gitlab.com' },
          { name: 'Bitbucket', url: 'https://bitbucket.org' },
        ],
      },
      {
        name: 'Testing & Debugging',
        apps: [
          { name: 'BrowserStack', url: 'https://www.browserstack.com' },
          { name: 'Appium', url: 'https://appium.io' },
          { name: 'Firebase Test Lab', url: 'https://firebase.google.com/products/test-lab' },
        ],
      },
      {
        name: 'Design & Prototyping',
        apps: [
          { name: 'Figma', url: 'https://www.figma.com' },
          { name: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html' },
          { name: 'Dribbble', url: 'https://dribbble.com' },
        ],
      },
      {
        name: 'Learning & Community',
        apps: [
          { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
          { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' },
          { name: 'Google Codelabs', url: 'https://codelabs.developers.google.com' },
        ],
      },
    ],
  },
  {
    name: 'Cybersecurity Expert OS',
    folders: [
      {
        name: 'Threat Intelligence',
        apps: [
          { name: 'VirusTotal', url: 'https://www.virustotal.com' },
          { name: 'Shodan', url: 'https://www.shodan.io' },
          { name: 'AlienVault OTX', url: 'https://otx.alienvault.com' },
        ],
      },
      {
        name: 'Penetration Testing',
        apps: [
          { name: 'Kali Linux Tools', url: 'https://www.kali.org/tools/' },
          { name: 'Metasploit', url: 'https://www.metasploit.com' },
          { name: 'Burp Suite', url: 'https://portswigger.net/burp' },
        ],
      },
      {
        name: 'Security Monitoring',
        apps: [
          { name: 'Splunk', url: 'https://www.splunk.com' },
          { name: 'Elastic Security', url: 'https://www.elastic.co/security' },
          { name: 'CrowdStrike', url: 'https://www.crowdstrike.com' },
        ],
      },
      {
        name: 'Vulnerability Scanning',
        apps: [
          { name: 'Nessus', url: 'https://www.tenable.com/products/nessus' },
          { name: 'Qualys', url: 'https://www.qualys.com' },
          { name: 'OpenVAS', url: 'https://www.openvas.org' },
        ],
      },
      {
        name: 'Incident Response',
        apps: [
          { name: 'TheHive', url: 'https://thehive-project.org' },
          { name: 'Cortex', url: 'https://www.thehive-project.org/cortex/' },
          { name: 'MISP', url: 'https://www.misp-project.org' },
        ],
      },
      {
        name: 'Learning & Certification',
        apps: [
          { name: 'TryHackMe', url: 'https://tryhackme.com' },
          { name: 'Hack The Box', url: 'https://www.hackthebox.com' },
          { name: 'Cybrary', url: 'https://www.cybrary.it' },
        ],
      },
      {
        name: 'Compliance & Governance',
        apps: [
          { name: 'NIST Framework', url: 'https://www.nist.gov/cyberframework' },
          { name: 'ISO 27001 Resources', url: 'https://www.iso.org/isoiec-27001-information-security.html' },
          { name: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks' },
        ],
      },
    ],
  },
  {
    name: 'Teacher/Educator OS',
    folders: [
      {
        name: 'Lesson Planning',
        apps: [
          { name: 'Notion', url: 'https://www.notion.so' },
          { name: 'Google Docs', url: 'https://docs.google.com' },
          { name: 'Canva', url: 'https://www.canva.com' },
        ],
      },
      {
        name: 'Classroom Management',
        apps: [
          { name: 'Google Classroom', url: 'https://classroom.google.com' },
          { name: 'Microsoft Teams for Education', url: 'https://www.microsoft.com/en-in/education/products/teams' },
          { name: 'Edmodo', url: 'https://new.edmodo.com' },
        ],
      },
      {
        name: 'Teaching Resources',
        apps: [
          { name: 'Khan Academy', url: 'https://www.khanacademy.org' },
          { name: 'TED-Ed', url: 'https://ed.ted.com' },
          { name: 'Teachers Pay Teachers', url: 'https://www.teacherspayteachers.com' },
        ],
      },
      {
        name: 'Student Engagement',
        apps: [
          { name: 'Kahoot!', url: 'https://kahoot.com' },
          { name: 'Quizizz', url: 'https://quizizz.com' },
          { name: 'Nearpod', url: 'https://nearpod.com' },
        ],
      },
      {
        name: 'Assessment & Grading',
        apps: [
          { name: 'Google Forms', url: 'https://forms.google.com' },
          { name: 'Socrative', url: 'https://www.socrative.com' },
          { name: 'Turnitin', url: 'https://www.turnitin.com' },
        ],
      },
      {
        name: 'Collaboration & Communication',
        apps: [
          { name: 'Slack', url: 'https://slack.com' },
          { name: 'Zoom', url: 'https://zoom.us' },
          { name: 'Remind', url: 'https://www.remind.com' },
        ],
      },
      {
        name: 'Professional Development',
        apps: [
          { name: 'Coursera', url: 'https://www.coursera.org' },
          { name: 'FutureLearn', url: 'https://www.futurelearn.com' },
          { name: 'EdX', url: 'https://www.edx.org' },
        ],
      },
    ],
  },
  {
    name: 'DevOps Engineer OS',
    folders: [
      {
        name: 'CI/CD Tools',
        apps: [
          { name: 'GitHub Actions', url: 'https://github.com/features/actions' },
          { name: 'GitLab CI/CD', url: 'https://docs.gitlab.com/ee/ci/' },
          { name: 'Jenkins', url: 'https://www.jenkins.io' },
        ],
      },
      {
        name: 'Infrastructure as Code',
        apps: [
          { name: 'Terraform', url: 'https://www.terraform.io' },
          { name: 'Pulumi', url: 'https://www.pulumi.com' },
          { name: 'Ansible', url: 'https://www.ansible.com' },
        ],
      },
      {
        name: 'Containerization & Orchestration',
        apps: [
          { name: 'Docker Hub', url: 'https://hub.docker.com' },
          { name: 'Kubernetes', url: 'https://kubernetes.io' },
          { name: 'Helm', url: 'https://helm.sh' },
        ],
      },
      {
        name: 'Cloud Platforms',
        apps: [
          { name: 'AWS Console', url: 'https://aws.amazon.com/console/' },
          { name: 'Google Cloud Console', url: 'https://console.cloud.google.com' },
          { name: 'Azure Portal', url: 'https://portal.azure.com' },
        ],
      },
      {
        name: 'Monitoring & Logging',
        apps: [
          { name: 'Prometheus', url: 'https://prometheus.io' },
          { name: 'Grafana', url: 'https://grafana.com' },
          { name: 'Datadog', url: 'https://www.datadoghq.com' },
        ],
      },
      {
        name: 'Security & Compliance',
        apps: [
          { name: 'Snyk', url: 'https://snyk.io' },
          { name: 'Trivy', url: 'https://github.com/aquasecurity/trivy' },
          { name: 'OWASP ZAP', url: 'https://www.zaproxy.org' },
        ],
      },
      {
        name: 'Learning & Documentation',
        apps: [
          { name: 'Linux Foundation Training', url: 'https://training.linuxfoundation.org' },
          { name: 'Kubernetes Docs', url: 'https://kubernetes.io/docs/' },
          { name: 'DevOps Roadmap', url: 'https://roadmap.sh/devops' },
        ],
      },
    ],
  },
] as const;
