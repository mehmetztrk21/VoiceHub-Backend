import fs from 'fs';

import util from 'util';

export const writeFile = util.promisify(fs.writeFile);
export const readFile = util.promisify(fs.readFile);
export const removeFile = util.promisify(fs.unlink);
export const renameFile = util.promisify(fs.rename);
export const existsFile = util.promisify(fs.exists);
export const mkdir = util.promisify(fs.mkdir);
export const rmdir = util.promisify(fs.rmdir);
export const readdir = util.promisify(fs.readdir);
export const changeFile = util.promisify(fs.chmod);