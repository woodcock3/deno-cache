export { resolve, join, extname, dirname } from "path";
export { createHash } from "crypto";
import * as fs from "fs/promises";
import { pathToFileURL } from "url";
import { platform } from "os";
function getFileInfoType(fileInfo) {
  return fileInfo.isFile() ? "file" : fileInfo.isDirectory() ? "dir" : fileInfo.isSymbolicLink() ? "symlink" : void 0;
}
export async function ensureDir(dir) {
  try {
    const fileInfo = await fs.lstat(dir);
    if (!fileInfo.isDirectory) {
      throw new Error(`Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(dir, { recursive: true });
      return;
    }
    throw err;
  }
}
export async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
export const toFileUrl = pathToFileURL;
export function fromFileUrl(url) {
  const isWindows = platform() === "win32";
  url = url instanceof URL ? url : new URL(url);
  if (url.protocol != "file:") {
    throw new TypeError("Must be a file URL.");
  }
  if (isWindows) {
    let path = decodeURIComponent(
      url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")
    ).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
      path = `\\\\${url.hostname}${path}`;
    }
    return path;
  } else {
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
  }
}
