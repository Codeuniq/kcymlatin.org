/**
 * Receives a generated poster from index.html and files it in the shared
 * Drive folder. Runs as the folder owner, so visitors upload without
 * signing in to Google.
 *
 * Deploy:
 *   1. script.google.com -> New project -> paste this file
 *   2. Deploy -> New deployment -> type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   3. Authorise Drive access when prompted
 *   4. Copy the /exec URL into UPLOAD_URL in index.html
 *
 * Re-deploy after any edit ("Manage deployments" -> edit -> New version),
 * otherwise the old code keeps serving.
 */

const FOLDER_ID = '1uYOM9pnA1GOowcM2MuWOqCBfM1fFx_fF';
const MAX_BYTES = 8 * 1024 * 1024;

function doPost(e){
  try {
    if (!e || !e.postData || !e.postData.contents) return reply({ok:false, error:'empty request'});

    const body = JSON.parse(e.postData.contents);
    const name = String(body.name || '').trim();
    const image = String(body.image || '');

    if (!name) return reply({ok:false, error:'name missing'});
    if (!/^data:image\/png;base64,/.test(image)) return reply({ok:false, error:'not a png'});

    const bytes = Utilities.base64Decode(image.slice(image.indexOf(',') + 1));
    if (bytes.length > MAX_BYTES) return reply({ok:false, error:'too large'});

    const blob = Utilities.newBlob(bytes, 'image/png', fileName(name, body.designation));
    const file = DriveApp.getFolderById(FOLDER_ID).createFile(blob);

    return reply({ok:true, id:file.getId()});
  } catch (err) {
    return reply({ok:false, error:String(err)});
  }
}

function fileName(name, designation){
  const stamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd_HHmmss');
  const parts = [name, designation].filter(String).join(' - ');
  const safe = parts.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 90);
  return stamp + ' ' + safe + '.png';
}

function reply(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
