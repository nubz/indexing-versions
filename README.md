# indexing-versions
A skeleton for Gov prototype kit (version 12.1.1) with an indexing and versioning system built in with an empty version 1-0.

### Using these files
Copy the `/app` folder and `/package.json` from the main branch into your newly created GovUK 
prototype kit, overwriting the existing ones. Then run `npm install` to ensure all 
required dependencies are installed. Your new prototype should be ready to start 
populating with content into an empty version 1-0 folder.

## Index tabs

This indexing system uses a tab based interface for each version's index view. The tabs are defined in the
index.html file within each version and each tab's content is a single html partial filed in the _index-tabs
folder inside each version. They can of course be hand coded into the index file, but experience of doing this
results in a long unwieldy page to maintain as it's copied forward into new versions, single focussed files are
easier to maintain. As the prototype owner you can add more tabs to the defined html structure in index.html
and populate as you see fit, you are also free to remove tabs and their related partial, it will not break 
anything.

### Maintaining _index-tabs/_pages.html
As you create new templates add corresponding links to view them in the index-tabs/_pages.html file
within the version folder, using class names `new-page` and `changed-page` will add badges to the links
for ease of scanning what has changed in each version.

### Maintaining _index-tabs/_changelog.html
An effective format is to use ticket numbers as links to the tickets and add a description 
of the changes made and use inline links to provide shortcuts to see pages that changed.

### Creating journeys
Link to the start page of each journey in here. Putting a form into `_index-tabs/_journeys.html` can mean 
journeys can be configured to run with preset values, a useful pattern might be to post the form to a 
dedicated route handler where the selections made in the form can inform any redirection required or pre-populate
data that deeper routes may rely on.

### Comparing versions
There is a footer link in 2 layout templates to compare versions of whatever page is rendered, when making 
service pages you can extend `layout-with-back-link.html` and `layout-without-back-link.html` to make
use the comparison tool. The tool looks for all versions of the same file name and renders them into a grid of 
iframes for instant comparison.

## Creating a new version
At the time of writing the new version automation still has a glitchy outcome, the link is in the footer of the main
index page when rendered on localhost and it almost always clones the old version you specify into a new version folder,
and almost always updates the index page with a link to the new version and almost always updates the latest version
to be your new version, what it sometimes fails to do is update the main routes.js file, sometimes it crashes the running
app when a request is made while the routes.js file is locked for writing (or something like that!) - so when
this happens and you are not automagically taken to the new index page (or if you are and page links and journeys are 
failing) then you may have to finish the setup by inserting the requisite hook for your new version's routes file within 
the top level routes file `app/routes.js`. For example `app.use('/3-0', 'views/3-0/routes.js')` where `3-0` is your new
version name. If the new version feature is not for you then instructions below for doing it manually:


## Making new versions manually
### Creating a new version as a new folder
Create new folder for the new version. We are using the naming system of 1-0 for version 1 and 2-0 for version 2 etc. So if we are creating a new version 2 then we create a new folder in the app/views folder called 2-0, either use file explorer or IDE to do this or use gitbash/terminal command

`mkdir app/views/2-0`

Copy everything in the previous version into the new folder, so when creating version 2 we copy all contents of 1-0 into 2-0 - this can be done with your file explorer windows or with gitbash/terminal using command

`cp -R app/views/1-0/* app/views/2-0`

### Global updates required
Things to update at a global level once a new version folder has been created:

1. The application routes.js (`app/routes.js`) file will need a new line added to tell the application which routes file to use when accessing this new version e.g. `router.use('/2-0', require('./views/2-0/routes'))`

2. The _latestVersion.js (`app/views/_latestVersion.js`) file will need updating to mark this new folder as the latest version e.g. `latestVersion: '2-0'`

3. We need to manually add a new link in the list of version links in the sidebar of the `app/views/index.html` page to the new version e.g. `<li><a href="/2-0" class="govuk-link">2-0</a></li>`

### New version files to update
Things to update at the new version level i.e. things that are inside the new version's folder

1. The `_config.js` file contains a value for this version, this needs updating to be the name of the folder e.g. version: '2-0'

2. The `_index-tabs/_changelog.html` file (which is included by the version index) contains a bullet list of changes, because this is a copy it will be the changes from the last version, so clear out the bullet items and leave just a single bullet to say which version has been cloned to create this one

3. The `_index-tabs/_pages.html` file (which is included by the version index) may have marked some pages with badges that say "changed" or "new" - we need to clear these badges out for the new version. The badges are rendered by CSS class names "changed-page" and "new-page" that have been added to the page links - to clear out the badges delete these class names wherever they appear in the _pages.html file.

The new version should now be showing as the default landing page for the prototype



