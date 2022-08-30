# indexing-versions
A skeleton for Gov prototype kit (version 12.1.1) with an indexing and versioning system built in with an empty version 1-0.

### Using these files
Copy the `/app` folder and `/package.json` from the main branch into your newly created GovUK 
prototype kit, overwriting the existing ones. Then run `npm install` to ensure all 
required dependencies are installed. Your new prototype should be ready to start 
populating with content into an empty version 1-0 folder.

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

#### Creating a new version
At the time of writing the new version automation still has a glitchy outcome, the link is in the footer of the main
index page when rendered on localhost and it almost always clones the old version you specify into a new version folder,
and almost always updates the index page with a link to the new version and almost always updates the latest version
to be your new version, what it sometimes fails to do is update the main routes.js file, sometimes it crashes the running
app when a request is made while the routes.js file is locked for writing (or something like that!) - so when
this happens and you are not automagically taken to the new index page (or if you are and page links and journeys are 
failing) then you may have to finish the setup by inserting the requisite hook for your new version's routes file within 
the top level routes file `app/routes.js`. For example `app.use('/3-0', 'views/3-0/routes.js')` where `3-0` is your new
version name.


