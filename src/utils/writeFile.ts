import fs from 'fs';

import util from 'util';

export const writeFile = util.promisify(fs.writeFile);
export const readFile = util.promisify(fs.readFile);
export const removeFile = util.promisify(fs.unlink);